"use client";

import React, { createContext, useContext, useState } from "react";

interface AiConciergeContextType {
  isOpen: boolean;
  initialQuery?: string;
  openConcierge: (query?: string) => void;
  closeConcierge: () => void;
}

const AiConciergeContext = createContext<AiConciergeContextType>({
  isOpen: false,
  openConcierge: () => {},
  closeConcierge: () => {},
});

export function AiConciergeProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string | undefined>(undefined);

  const openConcierge = (query?: string) => {
    if (query) {
      setInitialQuery(query);
    }
    setIsOpen(true);
  };

  const closeConcierge = () => {
    setIsOpen(false);
  };

  return (
    <AiConciergeContext.Provider
      value={{ isOpen, initialQuery, openConcierge, closeConcierge }}
    >
      {children}
    </AiConciergeContext.Provider>
  );
}

export function useAiConcierge() {
  return useContext(AiConciergeContext);
}
