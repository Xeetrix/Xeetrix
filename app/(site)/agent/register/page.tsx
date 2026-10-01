"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  User,
  MapPin,
  FileText,
} from "lucide-react";
import { registerAgent } from "@/lib/db-service";

export default function AgentRegistrationPage() {
  const [agencyName, setAgencyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [country, setCountry] = useState("Bangladesh");
  const [tradeLicense, setTradeLicense] = useState("");
  const [website, setWebsite] = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("10 - 50 tickets");
  const [existingBusiness, setExistingBusiness] = useState(true);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successAgentCode, setSuccessAgentCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agencyName.trim() || !ownerName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg("Please fill in all required agency, owner, phone, and email fields.");
      return;
    }

    setLoading(true);

    try {
      const agent = await registerAgent({
        agencyName: agencyName.trim(),
        ownerName: ownerName.trim(),
        contactPerson: (contactPerson || ownerName).trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        tradeLicenseNumber: tradeLicense.trim() || undefined,
        website: website.trim() || undefined,
        expectedMonthlyVolume: monthlyVolume,
        existingBusiness,
        notes: notes.trim() || undefined,
        commissionType: "PERCENTAGE",
        commissionValue: 3,
        markupType: "PERCENTAGE",
        markupValue: 2,
      });

      setSuccessAgentCode(agent.agentCode);
    } catch (err: any) {
      console.error("Agent registration error:", err);
      setErrorMsg(err.message || "Failed to submit agent application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-14 bg-slate-50 min-h-screen">
      <Container size="wide" className="max-w-3xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Agents", href: "/agents" },
            { label: "Registration" },
          ]}
        />

        {/* Header */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            <Building2 className="h-4 w-4" />
            <span>Xeetrix Sub-Agent Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display">
            B2B Agent Registration Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            Fill out your agency information below. Your registration will be reviewed by the Xeetrix administrative desk within 24 hours.
          </p>
        </div>

        {/* Success Card */}
        {successAgentCode ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 text-center shadow-sm space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900">
              Application Submitted Successfully!
            </h2>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 max-w-md mx-auto space-y-1">
              <span className="text-slate-600 block">Your Assigned Agent Application ID:</span>
              <span className="font-mono text-xl font-black text-emerald-800 tracking-wider">
                {successAgentCode}
              </span>
              <span className="text-[11px] text-emerald-700 block mt-1">
                Status: <strong>PENDING REVIEW</strong>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Our accounts team has received your registration. Once approved, you will be notified via phone and email to access your B2B Agent Portal.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/agent/login"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
              >
                Go to Agent Login
              </Link>
              <Link
                href="/"
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Agency Basics */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                  1. Agency Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Agency Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Skyline Travel & Tours"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Trade License Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TRAD/DNCC/10294"
                      value={tradeLicense}
                      onChange={(e) => setTradeLicense(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Agency Website / Facebook Page</label>
                    <input
                      type="text"
                      placeholder="e.g. https://facebook.com/myagency"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expected Monthly Volume</label>
                    <select
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                    >
                      <option value="5 - 15 tickets">5 - 15 tickets / month</option>
                      <option value="15 - 50 tickets">15 - 50 tickets / month</option>
                      <option value="50 - 150 tickets">50 - 150 tickets / month</option>
                      <option value="150+ tickets">150+ tickets / month</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Owner & Contact Person */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                  2. Owner & Contact Person
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name *</label>
                    <input
                      type="text"
                      placeholder="Full Name of Proprietor"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="Leave blank if same as owner"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      placeholder="+880 1700 000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      placeholder="agency@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Physical Location */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                  3. Address & Business Background
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
                    <input
                      type="text"
                      placeholder="Shop/Office No, Building, Road, Area"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka, Chittagong, Sylhet"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="existingBiz"
                    checked={existingBusiness}
                    onChange={(e) => setExistingBusiness(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="existingBiz" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    We currently operate an active travel/visa service business in Bangladesh
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Tell us about your target routes (e.g. Umrah, Middle East manpower, student tickets)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Agent Application</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </Container>
    </div>
  );
}
