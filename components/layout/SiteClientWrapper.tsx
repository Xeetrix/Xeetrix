"use client";

import React, { useState } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  AiFlightConcierge,
  AiConciergeFloatingButton,
} from "@/components/AiFlightConcierge";
import { AuthModal } from "@/components/AuthModal";

export function SiteClientWrapper({ children }: { children: React.ReactNode }) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar
          onOpenAiConcierge={() => setIsAiOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Global AI Flight Concierge Modal */}
        <AiFlightConcierge
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
        />

        {/* Global Floating AI Trigger Button */}
        <AiConciergeFloatingButton onClick={() => setIsAiOpen(true)} />

        {/* Global Auth & Passenger Profile Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      </div>
    </AuthProvider>
  );
}
