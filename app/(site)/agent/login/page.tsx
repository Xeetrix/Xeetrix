"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Building2,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, getDocs, query, collection, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Agent } from "@/lib/types";

export default function AgentLoginPage() {
  const router = useRouter();
  const { user, isAgent, agentProfile, signInWithEmail, signInWithGoogle, role, isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  // If already logged in and verified agent, redirect to dashboard
  useEffect(() => {
    if (user && isAgent && agentProfile?.status === "APPROVED") {
      router.push("/agent/dashboard");
    } else if (user && isAdmin) {
      router.push("/admin");
    } else if (user && agentProfile && agentProfile.status === "PENDING") {
      setPendingNotice(
        `Agent application ${agentProfile.agentCode} (${agentProfile.agencyName}) is currently under review. Our admin team will approve your account shortly.`
      );
    }
  }, [user, isAgent, agentProfile, isAdmin, router]);

  const verifyAgentStatus = async (userEmail: string) => {
    try {
      const q = query(collection(db, "agents"), where("email", "==", userEmail.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const agent = snap.docs[0].data() as Agent;
        if (agent.status === "APPROVED") {
          router.push("/agent/dashboard");
          return;
        } else if (agent.status === "PENDING") {
          setPendingNotice(
            `Agent application ${agent.agentCode} (${agent.agencyName}) is currently under review by Xeetrix admin. You will be notified once activated.`
          );
          return;
        } else if (agent.status === "SUSPENDED" || agent.status === "REJECTED") {
          setErrorMsg(`This agent account is currently ${agent.status.toLowerCase()}. Please contact the administration desk.`);
          return;
        }
      } else {
        // No agent record found for this email
        setPendingNotice(
          "No registered agent account was found for this email. If you recently applied, your application is being processed or you may apply below."
        );
      }
    } catch (err: any) {
      console.error("Agent verification error:", err);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPendingNotice(null);
    setLoading(true);

    try {
      await signInWithEmail(email.trim(), password);
      await verifyAgentStatus(email.trim());
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setPendingNotice(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      // verification will happen in useEffect
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign-in was cancelled.");
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-16 bg-slate-50 min-h-screen">
      <Container size="wide" className="max-w-md space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Agents", href: "/agents" },
            { label: "Login" },
          ]}
        />

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white text-center shadow-xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            <Building2 className="h-4 w-4" />
            <span>Xeetrix B2B Portal</span>
          </div>
          <h1 className="text-2xl font-black font-display text-white">
            Travel Agent Login
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Access wholesale GDS flight inventory, booking requests, and commission reports.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {pendingNotice && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Application Status Notice</span>
            </div>
            <p>{pendingNotice}</p>
          </div>
        )}

        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agent Official Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="agent@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 pl-9 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 pl-9 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login to Agent Portal"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="relative py-2 text-center text-xs text-slate-400">
            <span className="bg-white px-2 relative z-10 font-semibold">Or continue with</span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Sign in with Google</span>
          </button>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
            <div>
              Not a registered agent yet?{" "}
              <Link href="/agent/register" className="font-bold text-emerald-700 hover:underline">
                Apply for Sub-Agent Account
              </Link>
            </div>
            <div>
              <Link href="/" className="text-slate-400 hover:text-slate-600">
                Back to Public Website
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
