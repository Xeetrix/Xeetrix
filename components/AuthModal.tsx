"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, CheckCircle2, User, LogOut, Ticket, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "@/components/ui/BrandLogo";
import Link from "next/link";

export function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, signInWithGoogle, logout, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setSubmitting(true);
      await logout();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to log out.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden relative"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {user ? (
              // Authenticated User State
              <div className="text-center">
                <div className="mx-auto relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-brand-700 border-2 border-emerald-200 overflow-hidden mb-4">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900">
                  {user.displayName || "Xeetrix Passenger"}
                </h3>
                <p className="text-sm text-slate-500">{user.email}</p>

                <div className="my-6 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                    <ShieldCheck className="h-4 w-4" />
                    Verified Passenger Account
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your flight inquiries, PNR status requests, and e-ticket documents are synced across your devices.
                  </p>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B5D3A] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#084A2E] transition-all"
                  >
                    <Ticket className="h-4 w-4" />
                    My Inquiries &amp; Bookings
                  </Link>

                  <button
                    onClick={handleLogout}
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <LogOut className="h-4 w-4 text-slate-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              // Unauthenticated Login State
              <div>
                <div className="mb-6 flex justify-center">
                  <BrandLogo size="md" variant="badge" />
                </div>

                <div className="text-center mb-6">
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    Sign in to Xeetrix
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Access your flight quotes, manage PNR status, and track ticket issuance.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white py-3.5 px-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all hover:border-slate-400"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#0B5D3A]" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-[#0B5D3A]" />
                      Direct GDS Inquiry Tracking
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-[#0B5D3A]" />
                      Personalized 40–46kg Baggage Quotas
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-[#0B5D3A]" />
                      Real-Time Date-Change Request Desk
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
