"use client";

import React, { useState } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { AiConciergeProvider, useAiConcierge } from "@/lib/ai-concierge-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import {
  AiFlightConcierge,
  AiConciergeFloatingButton,
} from "@/components/AiFlightConcierge";
import { AuthModal } from "@/components/AuthModal";

function SiteLayoutInner({ children }: { children: React.ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isOpen: isAiOpen, initialQuery, openConcierge, closeConcierge } = useAiConcierge();

  return (
    <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
      <Navbar
        onOpenAiConcierge={() => openConcierge()}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Global AI Flight Concierge Modal */}
      <AiFlightConcierge
        isOpen={isAiOpen}
        onClose={closeConcierge}
        initialQuery={initialQuery}
      />

      {/* Global Floating AI Trigger Button (Desktop) */}
      <AiConciergeFloatingButton onClick={() => openConcierge()} />

      {/* Global Mobile Sticky Bottom Nav (Mobile/Tablet) */}
      <MobileBottomNav
        onOpenAiConcierge={() => openConcierge()}
      />

      {/* Global Auth & Passenger Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export function SiteClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AiConciergeProvider>
        <SiteLayoutInner>{children}</SiteLayoutInner>
      </AiConciergeProvider>
    </AuthProvider>
  );
}
