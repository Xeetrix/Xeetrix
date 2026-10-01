import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Booking,
  BookingStatus,
  Agent,
  AgentStatus,
  QuoteDetails,
  PaymentDetails,
  TicketDetails,
  AuditLog,
  RefundRequest,
} from "@/lib/types";

// Generate unique B2C/B2B booking reference: e.g. XE-B2C-20260929-0001
export function generateBookingReference(channel: "B2C" | "B2B"): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `XE-${channel}-${y}${m}${d}-${randomSuffix}`;
}

// Generate unique Agent Code: e.g. XE-AG-1042
export function generateAgentCode(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `XE-AG-${random}`;
}

/**
 * Log sensitive administrative or financial actions into Firestore audit_logs
 */
export async function createAuditLog(
  actor: string,
  actorRole: string,
  action: string,
  entity: AuditLog["entity"],
  entityId: string,
  metadata?: Record<string, any>
) {
  try {
    const colRef = collection(db, "audit_logs");
    await addDoc(colRef, {
      actor,
      actorRole,
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

/**
 * Create a new Flight Booking Request
 */
export async function createBookingRequest(
  data: Omit<Booking, "id" | "bookingReference" | "status" | "timeline" | "createdAt" | "updatedAt">
): Promise<Booking> {
  const reference = generateBookingReference(data.channel);
  const now = new Date().toISOString();

  const newBooking: Booking = {
    ...data,
    id: reference,
    bookingReference: reference,
    status: "REQUESTED",
    timeline: [
      {
        status: "REQUESTED",
        timestamp: now,
        actor: data.customerName,
        actorRole: data.channel === "B2B" ? "AGENT" : "CUSTOMER",
        note: `Flight booking request submitted for ${data.origin} → ${data.destination}`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const docRef = doc(db, "bookings", reference);
  await setDoc(docRef, newBooking);

  await createAuditLog(
    data.customerEmail,
    data.channel === "B2B" ? "AGENT" : "CUSTOMER",
    "CREATE_BOOKING_REQUEST",
    "BOOKING",
    reference,
    { channel: data.channel, origin: data.origin, destination: data.destination }
  );

  return newBooking;
}

/**
 * Fetch booking by its reference code (Publicly used for tracking)
 */
export async function getBookingByReference(reference: string): Promise<Booking | null> {
  try {
    const cleanRef = reference.trim().toUpperCase();
    const docRef = doc(db, "bookings", cleanRef);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Booking;
    }

    // Secondary query check
    const q = query(collection(db, "bookings"), where("bookingReference", "==", cleanRef), limit(1));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      return qSnap.docs[0].data() as Booking;
    }

    return null;
  } catch (err) {
    console.error("Error fetching booking by reference:", err);
    return null;
  }
}

/**
 * Admin: Add a Fare Quote to a Booking
 */
export async function addQuoteToBooking(
  bookingId: string,
  quote: QuoteDetails,
  actorEmail: string
) {
  const docRef = doc(db, "bookings", bookingId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Booking not found");

  const current = snap.data() as Booking;
  const now = new Date().toISOString();

  const updatedTimeline = [
    ...(current.timeline || []),
    {
      status: "QUOTED" as BookingStatus,
      timestamp: now,
      actor: actorEmail,
      actorRole: "ADMIN",
      note: `Fare confirmed: ${quote.currency} ${quote.customerFare.toLocaleString()} (Supplier: ${quote.supplierFare}, Markup: ${quote.xeetrixMarkup})`,
    },
  ];

  await updateDoc(docRef, {
    quote,
    status: "QUOTED",
    timeline: updatedTimeline,
    updatedAt: now,
  });

  await createAuditLog(actorEmail, "ADMIN", "ADD_QUOTE", "QUOTE", bookingId, quote);
}

/**
 * Customer / Agent: Submit Payment Proof
 */
export async function submitBookingPayment(
  bookingId: string,
  payment: Omit<PaymentDetails, "paymentStatus" | "submittedAt">,
  actorEmail: string
) {
  const docRef = doc(db, "bookings", bookingId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Booking not found");

  const current = snap.data() as Booking;
  const now = new Date().toISOString();

  const fullPayment: PaymentDetails = {
    ...payment,
    paymentStatus: "PAYMENT_SUBMITTED",
    submittedAt: now,
  };

  const updatedTimeline = [
    ...(current.timeline || []),
    {
      status: "PAYMENT_SUBMITTED" as BookingStatus,
      timestamp: now,
      actor: actorEmail,
      actorRole: current.channel === "B2B" ? "AGENT" : "CUSTOMER",
      note: `Payment submitted via ${payment.method} (TxID: ${payment.transactionId}) for ${payment.currency} ${payment.amount}`,
    },
  ];

  await updateDoc(docRef, {
    payment: fullPayment,
    status: "PAYMENT_SUBMITTED",
    timeline: updatedTimeline,
    updatedAt: now,
  });

  await createAuditLog(actorEmail, current.channel, "SUBMIT_PAYMENT", "PAYMENT", bookingId, {
    method: payment.method,
    transactionId: payment.transactionId,
    amount: payment.amount,
  });
}

/**
 * Admin: Verify or Reject Payment
 */
export async function verifyBookingPayment(
  bookingId: string,
  verified: boolean,
  actorEmail: string,
  rejectionReason?: string
) {
  const docRef = doc(db, "bookings", bookingId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Booking not found");

  const current = snap.data() as Booking;
  const now = new Date().toISOString();

  if (!current.payment) throw new Error("No payment submitted for this booking");

  const newStatus: BookingStatus = verified ? "PAYMENT_VERIFIED" : "AWAITING_PAYMENT";
  const updatedPayment: PaymentDetails = {
    ...current.payment,
    paymentStatus: verified ? "PAID" : "REJECTED",
    verifiedBy: actorEmail,
    verifiedAt: now,
    rejectionReason: verified ? undefined : rejectionReason,
  };

  const updatedTimeline = [
    ...(current.timeline || []),
    {
      status: newStatus,
      timestamp: now,
      actor: actorEmail,
      actorRole: "ADMIN",
      note: verified
        ? `Payment verified by ${actorEmail}. Processing ticket issuance.`
        : `Payment rejected by ${actorEmail}. Reason: ${rejectionReason || "Invalid transaction details"}`,
    },
  ];

  await updateDoc(docRef, {
    payment: updatedPayment,
    status: newStatus,
    timeline: updatedTimeline,
    updatedAt: now,
  });

  await createAuditLog(actorEmail, "ADMIN", verified ? "VERIFY_PAYMENT" : "REJECT_PAYMENT", "PAYMENT", bookingId, {
    verified,
    rejectionReason,
  });
}

/**
 * Admin: Issue Ticket & Upload E-Ticket
 */
export async function issueBookingTicket(
  bookingId: string,
  ticket: TicketDetails,
  actorEmail: string
) {
  const docRef = doc(db, "bookings", bookingId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Booking not found");

  const current = snap.data() as Booking;
  const now = new Date().toISOString();

  const updatedTicket: TicketDetails = {
    ...ticket,
    issuedAt: now,
    issuedBy: actorEmail,
  };

  const updatedTimeline = [
    ...(current.timeline || []),
    {
      status: "TICKETED" as BookingStatus,
      timestamp: now,
      actor: actorEmail,
      actorRole: "ADMIN",
      note: `Ticket issued with PNR ${ticket.pnr}. E-Ticket available for download.`,
    },
  ];

  await updateDoc(docRef, {
    ticket: updatedTicket,
    status: "TICKETED",
    timeline: updatedTimeline,
    updatedAt: now,
  });

  await createAuditLog(actorEmail, "ADMIN", "ISSUE_TICKET", "TICKET", bookingId, {
    pnr: ticket.pnr,
    eTicketNumber: ticket.eTicketNumber,
  });
}

/**
 * Register a new B2B Agent
 */
export async function registerAgent(
  data: Omit<Agent, "id" | "agentCode" | "status" | "creditEnabled" | "creditLimit" | "outstandingAmount" | "totalBookings" | "totalSales" | "totalCommission" | "createdAt" | "updatedAt">
): Promise<Agent> {
  const agentCode = generateAgentCode();
  const now = new Date().toISOString();

  const newAgent: Agent = {
    ...data,
    id: agentCode,
    agentCode,
    status: "PENDING",
    creditEnabled: false,
    creditLimit: 0,
    outstandingAmount: 0,
    commissionType: data.commissionType || "PERCENTAGE",
    commissionValue: data.commissionValue || 3, // default 3% commission
    markupType: data.markupType || "PERCENTAGE",
    markupValue: data.markupValue || 2,
    totalBookings: 0,
    totalSales: 0,
    totalCommission: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = doc(db, "agents", agentCode);
  await setDoc(docRef, newAgent);

  await createAuditLog(data.email, "AGENT", "REGISTER_AGENT", "AGENT", agentCode, {
    agencyName: data.agencyName,
    ownerName: data.ownerName,
  });

  return newAgent;
}

/**
 * Admin: Approve / Reject / Suspend Agent
 */
export async function updateAgentStatus(
  agentCode: string,
  status: AgentStatus,
  actorEmail: string,
  commissionValue?: number,
  creditEnabled?: boolean,
  creditLimit?: number
) {
  const docRef = doc(db, "agents", agentCode);
  const now = new Date().toISOString();

  const updatePayload: any = {
    status,
    updatedAt: now,
  };

  if (status === "APPROVED") {
    updatePayload.approvedBy = actorEmail;
    updatePayload.approvedAt = now;
  }

  if (commissionValue !== undefined) {
    updatePayload.commissionValue = commissionValue;
  }

  if (creditEnabled !== undefined) {
    updatePayload.creditEnabled = creditEnabled;
  }

  if (creditLimit !== undefined) {
    updatePayload.creditLimit = creditLimit;
  }

  await updateDoc(docRef, updatePayload);

  await createAuditLog(actorEmail, "ADMIN", `UPDATE_AGENT_STATUS_${status}`, "AGENT", agentCode, {
    status,
    commissionValue,
    creditEnabled,
  });
}
