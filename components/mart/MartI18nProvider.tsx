"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MART_DICTIONARY, MartDictionary, MartLang } from "@/lib/martI18n";

const MART_LANG_STORAGE_KEY = "xeetrix_mart_lang_v1";

interface MartI18nContextValue {
  lang: MartLang;
  setLang: (next: MartLang) => void;
  toggleLang: () => void;
  t: MartDictionary;
}

const MartI18nContext = createContext<MartI18nContextValue>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  t: MART_DICTIONARY.en,
});

export function MartI18nProvider({ children }: { children: React.ReactNode }) {
  // Default to English on initial visit, then hydrate saved localStorage preference seamlessly
  const [lang, setLangState] = useState<MartLang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MART_LANG_STORAGE_KEY);
      if (saved === "bn" || saved === "en") {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const setLang = useCallback((next: MartLang) => {
    setLangState(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
    try {
      localStorage.setItem(MART_LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage quota issues
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "bn" : "en");
  }, [lang, setLang]);

  const value = useMemo<MartI18nContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: MART_DICTIONARY[lang],
    }),
    [lang, setLang, toggleLang]
  );

  return <MartI18nContext.Provider value={value}>{children}</MartI18nContext.Provider>;
}

export function useMartI18n(): MartI18nContextValue {
  return useContext(MartI18nContext);
}
