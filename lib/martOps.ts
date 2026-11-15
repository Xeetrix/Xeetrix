// Pure Business Intelligence, Sourcing, Accounting P&L & 360 CRM Engine for Xeetrix Mart

import {
  MartCollectionMode,
  MartCrmLog,
  MartCrmProfile,
  MartCrmTier,
  MartFulfillmentType,
  MartItemStatus,
  MartOrder,
  MartOrderItem,
  MartProduct,
  MartSupplier,
  MartTransaction,
  MartVariationVariant,
  parseOrderItems,
  parseVariationMatrix,
} from "./martApi";
import { MART_ENTERPRISE_DICTIONARY } from "./martEnterpriseI18n";
import { MartLang, parseCsvSlugs } from "./martI18n";

export const UNLIMITED_DROPSHIP_MAX_QTY = 999;

export function normalizePhoneKey(phone?: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length >= 10) {
    return digits.slice(-11);
  }
  return digits;
}

export function getEffectiveProductStock(product: MartProduct): number {
  const matrix = parseVariationMatrix(product.variationMatrixJson);
  if (matrix.length > 0) {
    return matrix
      .filter((v) => v.active)
      .reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0);
  }
  return Math.max(0, Number(product.stock) || 0);
}

export function isProductOrderable(product: MartProduct): boolean {
  if (!product.active) return false;
  if (product.fulfillmentType === "dropship") {
    return product.supplierAvailable !== false;
  }
  return getEffectiveProductStock(product) > 0;
}

export function getProductOrderableMaxQty(
  product: MartProduct,
  variant?: MartVariationVariant
): number {
  if (!product.active) return 0;
  if (product.fulfillmentType === "dropship") {
    if (product.supplierAvailable === false) return 0;
    if (variant && !variant.active) return 0;
    return UNLIMITED_DROPSHIP_MAX_QTY;
  }
  if (variant) {
    return variant.active ? Math.max(0, Number(variant.stock) || 0) : 0;
  }
  return getEffectiveProductStock(product);
}

export interface ResolvedOrderItem extends MartOrderItem {
  resolvedFulfillmentType: MartFulfillmentType;
  resolvedSupplierId: string;
  resolvedSupplierName: string;
  resolvedCollectionMode: MartCollectionMode;
  resolvedUnitCost: number;
  resolvedLineTotal: number;
  resolvedLineCost: number;
  resolvedLineProfit: number;
  resolvedStatus: MartItemStatus;
}

export interface ResolvedOrderFinancials {
  order: MartOrder;
  items: ResolvedOrderItem[];
  validSales: number;
  discountAmount: number;
  netSales: number;
  validCost: number;
  ownStockCost: number;
  dropshipCost: number;
  grossProfit: number;
  hasReturnedOrCancelledItems: boolean;
  isFullyCancelledOrReturned: boolean;
}

export function resolveOrderFinancials(
  order: MartOrder,
  prodMap: Map<string, MartProduct>,
  supMap: Map<string, MartSupplier>
): ResolvedOrderFinancials {
  const rawItems = parseOrderItems(order.itemsJson);
  const orderCancelled = order.status === "Cancelled";

  let validSales = 0;
  let validCost = 0;
  let ownStockCost = 0;
  let dropshipCost = 0;
  let hasReturnedOrCancelledItems = false;

  const items: ResolvedOrderItem[] = rawItems.map((item) => {
    const prod = prodMap.get(item.productId);
    const resolvedFulfillmentType: MartFulfillmentType =
      item.fulfillmentType || (prod ? prod.fulfillmentType : "own_stock") || "own_stock";
    const resolvedSupplierId =
      item.supplierId !== undefined && item.supplierId !== ""
        ? item.supplierId
        : prod?.supplierId || "";
    const sup = resolvedSupplierId ? supMap.get(resolvedSupplierId) : undefined;
    const resolvedSupplierName =
      item.supplierName || sup?.name || prod?.sourceName || "";
    const resolvedCollectionMode: MartCollectionMode =
      item.collectionMode ||
      prod?.collectionMode ||
      (sup?.payoutMode === "supplier_pays_us" ? "supplier_collects" : "store_collects");

    const qty = Math.max(1, Number(item.quantity) || 1);
    const resolvedUnitCost =
      item.unitCost !== undefined && item.unitCost !== null
        ? Number(item.unitCost) || 0
        : prod
        ? Number(prod.costPrice) || 0
        : 0;
    const resolvedLineTotal =
      Number(item.lineTotal) || (Number(item.unitPrice) || 0) * qty;
    const resolvedLineCost =
      item.lineCost !== undefined ? Number(item.lineCost) || 0 : resolvedUnitCost * qty;
    const resolvedLineProfit = resolvedLineTotal - resolvedLineCost;

    const resolvedStatus: MartItemStatus = orderCancelled
      ? "Cancelled"
      : item.itemStatus || (order.status === "Delivered" ? "Delivered" : "Pending");

    const excluded = resolvedStatus === "Cancelled" || resolvedStatus === "Returned";
    if (excluded) {
      hasReturnedOrCancelledItems = true;
    } else {
      validSales += resolvedLineTotal;
      validCost += resolvedLineCost;
      if (resolvedFulfillmentType === "dropship") {
        dropshipCost += resolvedLineCost;
      } else {
        ownStockCost += resolvedLineCost;
      }
    }

    return {
      ...item,
      resolvedFulfillmentType,
      resolvedSupplierId,
      resolvedSupplierName,
      resolvedCollectionMode,
      resolvedUnitCost,
      resolvedLineTotal,
      resolvedLineCost,
      resolvedLineProfit,
      resolvedStatus,
    };
  });

  // Fallback for legacy/summary-only orders without itemsJson
  if (rawItems.length === 0 && !orderCancelled) {
    validSales = Number(order.subtotal) || 0;
  }

  const allItemsExcluded =
    items.length > 0 &&
    items.every((i) => i.resolvedStatus === "Cancelled" || i.resolvedStatus === "Returned");
  const isFullyCancelledOrReturned = orderCancelled || allItemsExcluded;
  const rawDiscount = isFullyCancelledOrReturned
    ? 0
    : Math.max(0, Number(order.discountAmount) || 0);
  const discountAmount = Math.min(validSales, rawDiscount);
  const netSales = Math.max(0, validSales - discountAmount);

  return {
    order,
    items,
    validSales,
    discountAmount,
    netSales,
    validCost,
    ownStockCost,
    dropshipCost,
    grossProfit: netSales - validCost,
    hasReturnedOrCancelledItems,
    isFullyCancelledOrReturned,
  };
}

export interface CustomerCrmSummary {
  entityKey: string;
  profileId: string;
  name: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  tierOverride: MartCrmTier;
  autoTier: Exclude<MartCrmTier, "auto" | "blocked">;
  effectiveTier: Exclude<MartCrmTier, "auto">;
  tags: string[];
  notes: string;
  followUpTask: string;
  nextFollowUpDate: string;
  lastContactedAt: string;
  isFollowUpDue: boolean;
  isOverdue: boolean;
  orderCount: number;
  deliveredCount: number;
  cancelledOrReturnedCount: number;
  deliverySuccessRate: number;
  returnCancelRate: number;
  totalSpend: number;
  deliveredSpend: number;
  estimatedProfit: number;
  lastOrderDate: string;
  orders: MartOrder[];
  logs: MartCrmLog[];
}

export function buildCustomerCrmSummaries(params: {
  orders: MartOrder[];
  crmProfiles: MartCrmProfile[];
  crmLogs: MartCrmLog[];
  prodMap: Map<string, MartProduct>;
  supMap: Map<string, MartSupplier>;
}): CustomerCrmSummary[] {
  const { orders, crmProfiles, crmLogs, prodMap, supMap } = params;
  const todayIso = new Date().toISOString().slice(0, 10);

  const profileMap = new Map<string, MartCrmProfile>();
  crmProfiles
    .filter((p) => p.entityType === "customer")
    .forEach((p) => {
      const k = normalizePhoneKey(p.entityKey || p.phone) || p.entityKey;
      if (k) profileMap.set(k, p);
    });

  const logsByKey = new Map<string, MartCrmLog[]>();
  crmLogs
    .filter((l) => l.entityType === "customer")
    .forEach((l) => {
      const k = normalizePhoneKey(l.entityKey) || l.entityKey;
      if (!k) return;
      const list = logsByKey.get(k) || [];
      list.push(l);
      logsByKey.set(k, list);
    });

  const orderAgg = new Map<
    string,
    {
      name: string;
      phone: string;
      address: string;
      orderCount: number;
      deliveredCount: number;
      cancelledOrReturnedCount: number;
      totalSpend: number;
      deliveredSpend: number;
      estimatedProfit: number;
      lastOrderDate: string;
      orders: MartOrder[];
    }
  >();

  orders.forEach((o) => {
    const key = normalizePhoneKey(o.phone) || o.phone.trim() || o.customerName.trim();
    if (!key) return;
    const fin = resolveOrderFinancials(o, prodMap, supMap);
    const isFailed =
      o.status === "Cancelled" ||
      fin.items.some((it) => it.resolvedStatus === "Returned") ||
      fin.isFullyCancelledOrReturned;
    const isDelivered = o.status === "Delivered" && !fin.isFullyCancelledOrReturned;
    const spend = !fin.isFullyCancelledOrReturned ? Number(o.totalAmount) || 0 : 0;
    const delSpend = isDelivered ? Number(o.totalAmount) || 0 : 0;

    const existing = orderAgg.get(key);
    if (existing) {
      existing.orderCount += 1;
      if (isDelivered) existing.deliveredCount += 1;
      if (isFailed) existing.cancelledOrReturnedCount += 1;
      existing.totalSpend += spend;
      existing.deliveredSpend += delSpend;
      existing.estimatedProfit += fin.grossProfit;
      existing.orders.push(o);
      if (o.createdAt > existing.lastOrderDate) {
        existing.lastOrderDate = o.createdAt;
        if (o.address) existing.address = o.address;
        if (o.customerName) existing.name = o.customerName;
        if (o.phone) existing.phone = o.phone;
      }
    } else {
      orderAgg.set(key, {
        name: o.customerName,
        phone: o.phone,
        address: o.address,
        orderCount: 1,
        deliveredCount: isDelivered ? 1 : 0,
        cancelledOrReturnedCount: isFailed ? 1 : 0,
        totalSpend: spend,
        deliveredSpend: delSpend,
        estimatedProfit: fin.grossProfit,
        lastOrderDate: o.createdAt,
        orders: [o],
      });
    }
  });

  const allKeys = new Set<string>([
    ...Array.from(orderAgg.keys()),
    ...Array.from(profileMap.keys()),
  ]);

  const summaries: CustomerCrmSummary[] = [];
  allKeys.forEach((key) => {
    const agg = orderAgg.get(key);
    const prof = profileMap.get(key);
    const logs = logsByKey.get(key) || [];

    const orderCount = agg?.orderCount || 0;
    const deliveredCount = agg?.deliveredCount || 0;
    const cancelledOrReturnedCount = agg?.cancelledOrReturnedCount || 0;
    const deliverySuccessRate =
      orderCount > 0 ? Math.round((deliveredCount / orderCount) * 100) : 0;
    const returnCancelRate =
      orderCount > 0 ? Math.round((cancelledOrReturnedCount / orderCount) * 100) : 0;

    const deliveredSpend = agg?.deliveredSpend || 0;
    const totalSpend = agg?.totalSpend || 0;

    // Automatic Tier & Risk Intelligence
    let autoTier: Exclude<MartCrmTier, "auto" | "blocked"> = "new";
    const isHighRisk =
      (cancelledOrReturnedCount >= 2 && returnCancelRate >= 35) ||
      (orderCount >= 2 && deliveredCount === 0 && returnCancelRate >= 50);

    if (isHighRisk) {
      autoTier = "high_risk";
    } else if (deliveredSpend >= 10000 || deliveredCount >= 3) {
      autoTier = "vip";
    } else if (orderCount >= 2) {
      autoTier = "regular";
    }

    const tierOverride = prof?.tierOverride || "auto";
    const effectiveTier: Exclude<MartCrmTier, "auto"> =
      tierOverride === "auto" ? autoTier : tierOverride;

    const nextFollowUpDate = prof?.nextFollowUpDate || "";
    const isFollowUpDue = Boolean(nextFollowUpDate && nextFollowUpDate <= todayIso);
    const isOverdue = Boolean(nextFollowUpDate && nextFollowUpDate < todayIso);

    summaries.push({
      entityKey: key,
      profileId: prof?.id || "",
      name: prof?.name || agg?.name || key,
      phone: prof?.phone || agg?.phone || key,
      altPhone: prof?.altPhone || "",
      email: prof?.email || "",
      address: prof?.address || agg?.address || "",
      tierOverride,
      autoTier,
      effectiveTier,
      tags: parseCsvSlugs(prof?.tags),
      notes: prof?.notes || "",
      followUpTask: prof?.followUpTask || "",
      nextFollowUpDate,
      lastContactedAt: prof?.lastContactedAt || logs[0]?.createdAt || "",
      isFollowUpDue,
      isOverdue,
      orderCount,
      deliveredCount,
      cancelledOrReturnedCount,
      deliverySuccessRate,
      returnCancelRate,
      totalSpend,
      deliveredSpend,
      estimatedProfit: agg?.estimatedProfit || 0,
      lastOrderDate: agg?.lastOrderDate || prof?.createdAt || "",
      orders: agg?.orders || [],
      logs,
    });
  });

  return summaries.sort((a, b) => {
    if (a.isFollowUpDue !== b.isFollowUpDue) return a.isFollowUpDue ? -1 : 1;
    if (b.totalSpend !== a.totalSpend) return b.totalSpend - a.totalSpend;
    return b.orderCount - a.orderCount;
  });
}

export interface SupplierSummary {
  supplier: MartSupplier;
  productCount: number;
  ownStockProductCount: number;
  dropshipProductCount: number;
  soldItemsQty: number;
  deliveredQty: number;
  returnedOrCancelledQty: number;
  deliverySuccessRate: number;
  returnRate: number;
  payableEarned: number;
  paidTotal: number;
  payableDue: number;
  receivableEarned: number;
  receivedTotal: number;
  receivableDue: number;
  isFollowUpDue: boolean;
  isOverdue: boolean;
  logs: MartCrmLog[];
}

export function buildSupplierSummaries(params: {
  suppliers: MartSupplier[];
  products: MartProduct[];
  orders: MartOrder[];
  transactions: MartTransaction[];
  crmLogs: MartCrmLog[];
}): SupplierSummary[] {
  const { suppliers, products, orders, transactions, crmLogs } = params;
  const todayIso = new Date().toISOString().slice(0, 10);

  const prodMap = new Map<string, MartProduct>();
  products.forEach((p) => prodMap.set(p.id, p));

  const supMap = new Map<string, MartSupplier>();
  suppliers.forEach((s) => supMap.set(s.id, s));

  const metricsMap = new Map<
    string,
    {
      soldItemsQty: number;
      deliveredQty: number;
      returnedOrCancelledQty: number;
      payableEarned: number;
      receivableEarned: number;
    }
  >();

  orders.forEach((order) => {
    const resolved = resolveOrderFinancials(order, prodMap, supMap);
    resolved.items.forEach((item) => {
      const sid = item.resolvedSupplierId;
      if (!sid) return;

      const cur = metricsMap.get(sid) || {
        soldItemsQty: 0,
        deliveredQty: 0,
        returnedOrCancelledQty: 0,
        payableEarned: 0,
        receivableEarned: 0,
      };

      const qty = Math.max(1, Number(item.quantity) || 1);
      cur.soldItemsQty += qty;

      if (item.resolvedStatus === "Returned" || item.resolvedStatus === "Cancelled") {
        cur.returnedOrCancelledQty += qty;
      } else {
        if (item.resolvedStatus === "Delivered") {
          cur.deliveredQty += qty;
        }
        // Only accrue payables/receivables on active/non-cancelled/non-returned items
        if (item.resolvedCollectionMode === "supplier_collects") {
          // Dropship partner collects COD from buyer & sends back our profit margin
          cur.receivableEarned += Math.max(0, item.resolvedLineTotal - item.resolvedLineCost);
        } else {
          // Store collects COD/advance & owes supplier the product cost
          cur.payableEarned += item.resolvedLineCost;
        }
      }

      metricsMap.set(sid, cur);
    });
  });

  const paidMap = new Map<string, number>();
  const receivedMap = new Map<string, number>();
  transactions.forEach((t) => {
    if (!t.supplierId) return;
    if (t.type === "supplier_payout") {
      paidMap.set(t.supplierId, (paidMap.get(t.supplierId) || 0) + t.amount);
    } else if (t.type === "dropship_receipt") {
      receivedMap.set(t.supplierId, (receivedMap.get(t.supplierId) || 0) + t.amount);
    }
  });

  return suppliers.map((sup) => {
    const linkedProds = products.filter((p) => p.supplierId === sup.id);
    const m = metricsMap.get(sup.id) || {
      soldItemsQty: 0,
      deliveredQty: 0,
      returnedOrCancelledQty: 0,
      payableEarned: 0,
      receivableEarned: 0,
    };

    const paidTotal = paidMap.get(sup.id) || 0;
    const receivedTotal = receivedMap.get(sup.id) || 0;
    const payableDue = m.payableEarned - paidTotal;
    const receivableDue = m.receivableEarned - receivedTotal;

    const deliverySuccessRate =
      m.soldItemsQty > 0 ? Math.round((m.deliveredQty / m.soldItemsQty) * 100) : 0;
    const returnRate =
      m.soldItemsQty > 0 ? Math.round((m.returnedOrCancelledQty / m.soldItemsQty) * 100) : 0;

    const logs = crmLogs.filter(
      (l) => l.entityType === "supplier" && l.entityKey === sup.id
    );
    const isFollowUpDue = Boolean(
      sup.nextFollowUpDate && sup.nextFollowUpDate <= todayIso
    );
    const isOverdue = Boolean(
      sup.nextFollowUpDate && sup.nextFollowUpDate < todayIso
    );

    return {
      supplier: sup,
      productCount: linkedProds.length,
      ownStockProductCount: linkedProds.filter((p) => p.fulfillmentType !== "dropship").length,
      dropshipProductCount: linkedProds.filter((p) => p.fulfillmentType === "dropship").length,
      soldItemsQty: m.soldItemsQty,
      deliveredQty: m.deliveredQty,
      returnedOrCancelledQty: m.returnedOrCancelledQty,
      deliverySuccessRate,
      returnRate,
      payableEarned: m.payableEarned,
      paidTotal,
      payableDue,
      receivableEarned: m.receivableEarned,
      receivedTotal,
      receivableDue,
      isFollowUpDue,
      isOverdue,
      logs,
    };
  });
}

export interface AccountingSummary {
  productRevenue: number;
  couponDiscounts: number;
  deliveryCollected: number;
  ownStockCogs: number;
  dropshipCogs: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
  marketingExpense: number;
  operatingExpense: number;
  returnShippingLoss: number;
  otherExpense: number;
  otherIncome: number;
  totalOpEx: number;
  netProfit: number;
  netMarginPct: number;
  inventoryPurchase: number;
  supplierPayoutsPaid: number;
  dropshipReceiptsCollected: number;
  totalPayableDue: number;
  totalReceivableDue: number;
  netCashPosition: number;
}

export function computeAccountingSummary(params: {
  products: MartProduct[];
  orders: MartOrder[];
  suppliers: MartSupplier[];
  transactions: MartTransaction[];
  supplierSummaries: SupplierSummary[];
  startDate?: string;
  endDate?: string;
}): AccountingSummary {
  const { products, orders, suppliers, transactions, supplierSummaries, startDate, endDate } =
    params;
  const prodMap = new Map<string, MartProduct>();
  products.forEach((p) => prodMap.set(p.id, p));
  const supMap = new Map<string, MartSupplier>();
  suppliers.forEach((s) => supMap.set(s.id, s));

  const inRange = (dateStr?: string) => {
    const d = String(dateStr || "").slice(0, 10);
    if (!d) return !startDate && !endDate;
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  };

  let productRevenue = 0;
  let couponDiscounts = 0;
  let deliveryCollected = 0;
  let ownStockCogs = 0;
  let dropshipCogs = 0;

  orders.forEach((o) => {
    if (!inRange(o.createdAt)) return;
    const fin = resolveOrderFinancials(o, prodMap, supMap);
    productRevenue += fin.netSales;
    couponDiscounts += fin.discountAmount;
    ownStockCogs += fin.ownStockCost;
    dropshipCogs += fin.dropshipCost;
    if (!fin.isFullyCancelledOrReturned) {
      deliveryCollected += Number(o.deliveryCharge) || 0;
    }
  });

  const totalCogs = ownStockCogs + dropshipCogs;
  const grossProfit = productRevenue - totalCogs;
  const grossMarginPct =
    productRevenue > 0 ? Math.round((grossProfit / productRevenue) * 100) : 0;

  let marketingExpense = 0;
  let operatingExpense = 0;
  let inventoryPurchase = 0;
  let returnShippingLoss = 0;
  let supplierPayoutsPaid = 0;
  let dropshipReceiptsCollected = 0;
  let otherIncome = 0;
  let otherExpense = 0;

  transactions.forEach((t) => {
    if (!inRange(t.date || t.createdAt)) return;
    const amt = Number(t.amount) || 0;
    switch (t.type) {
      case "marketing_expense":
        marketingExpense += amt;
        break;
      case "operating_expense":
        operatingExpense += amt;
        break;
      case "inventory_purchase":
        inventoryPurchase += amt;
        break;
      case "return_shipping_loss":
        returnShippingLoss += amt;
        break;
      case "supplier_payout":
        supplierPayoutsPaid += amt;
        break;
      case "dropship_receipt":
        dropshipReceiptsCollected += amt;
        break;
      case "other_income":
        otherIncome += amt;
        break;
      case "other_expense":
        otherExpense += amt;
        break;
    }
  });

  const totalOpEx = marketingExpense + operatingExpense + returnShippingLoss + otherExpense;
  const netProfit = grossProfit + otherIncome - totalOpEx;
  const netMarginPct =
    productRevenue > 0 ? Math.round((netProfit / productRevenue) * 100) : 0;

  // All-time Payables & Receivables from suppliers engine
  const totalPayableDue = supplierSummaries.reduce(
    (s, item) => s + Math.max(0, item.payableDue),
    0
  );
  const totalReceivableDue = supplierSummaries.reduce(
    (s, item) => s + Math.max(0, item.receivableDue),
    0
  );

  // Cashflow Balance: (Product Revenue from store collections + Dropship Cash Received + Other Income) - (OpEx + Inventory Restock + Supplier Payouts)
  const netCashPosition =
    productRevenue +
    dropshipReceiptsCollected +
    otherIncome -
    (totalOpEx + inventoryPurchase + supplierPayoutsPaid);

  return {
    productRevenue,
    couponDiscounts,
    deliveryCollected,
    ownStockCogs,
    dropshipCogs,
    totalCogs,
    grossProfit,
    grossMarginPct,
    marketingExpense,
    operatingExpense,
    returnShippingLoss,
    otherExpense,
    otherIncome,
    totalOpEx,
    netProfit,
    netMarginPct,
    inventoryPurchase,
    supplierPayoutsPaid,
    dropshipReceiptsCollected,
    totalPayableDue,
    totalReceivableDue,
    netCashPosition,
  };
}

export interface DashboardFollowUpItem {
  id: string;
  entityType: "customer" | "supplier";
  entityKey: string;
  name: string;
  phone: string;
  nextFollowUpDate: string;
  task: string;
  tierOrType: string;
  isOverdue: boolean;
  isDueToday: boolean;
}

export function buildFollowUpQueue(
  customers: CustomerCrmSummary[],
  suppliers: SupplierSummary[]
): DashboardFollowUpItem[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  const items: DashboardFollowUpItem[] = [];

  customers.forEach((c) => {
    if (!c.nextFollowUpDate) return;
    items.push({
      id: `cust-${c.entityKey}`,
      entityType: "customer",
      entityKey: c.entityKey,
      name: c.name,
      phone: c.phone,
      nextFollowUpDate: c.nextFollowUpDate,
      task: c.followUpTask,
      tierOrType: c.effectiveTier,
      isOverdue: c.nextFollowUpDate < todayIso,
      isDueToday: c.nextFollowUpDate === todayIso,
    });
  });

  suppliers.forEach((s) => {
    if (!s.supplier.nextFollowUpDate) return;
    items.push({
      id: `sup-${s.supplier.id}`,
      entityType: "supplier",
      entityKey: s.supplier.id,
      name: s.supplier.name,
      phone: s.supplier.phone,
      nextFollowUpDate: s.supplier.nextFollowUpDate,
      task: s.supplier.notes,
      tierOrType: s.supplier.companyType,
      isOverdue: s.supplier.nextFollowUpDate < todayIso,
      isDueToday: s.supplier.nextFollowUpDate === todayIso,
    });
  });

  return items.sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate));
}

export function exportMartAccountingToCsv(
  transactions: MartTransaction[],
  lang: MartLang
): void {
  const headers = MART_ENTERPRISE_DICTIONARY[lang].accounts.csvHeaders;
  const escapeCsv = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const rows = transactions.map((t) => [
    t.id,
    t.date,
    MART_ENTERPRISE_DICTIONARY[lang].accounts.txnTypes[t.type] || t.type,
    t.category,
    t.amount,
    t.paymentAccount,
    t.supplierId,
    t.orderId,
    t.referenceNo,
    t.note,
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `xeetrix-mart-accounts-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportMartCustomersToCsv(
  customers: CustomerCrmSummary[],
  lang: MartLang
): void {
  const headers = MART_ENTERPRISE_DICTIONARY[lang].crm.csvHeaders;
  const escapeCsv = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const rows = customers.map((c) => [
    c.name,
    c.phone,
    c.email,
    c.address,
    MART_ENTERPRISE_DICTIONARY[lang].crm.tiers[c.effectiveTier] || c.effectiveTier,
    c.orderCount,
    c.deliveredCount,
    c.cancelledOrReturnedCount,
    `${c.deliverySuccessRate}%`,
    c.totalSpend,
    c.estimatedProfit,
    c.tags.join(", "),
    c.nextFollowUpDate,
    c.followUpTask,
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `xeetrix-mart-crm-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
