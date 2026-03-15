"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "ja" | "en";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "ja";
  const saved = window.localStorage.getItem("lang");
  if (saved === "ja" || saved === "en") return saved;
  const nav = window.navigator.language.toLowerCase();
  return nav.startsWith("ja") ? "ja" : "en";
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Lang>("ja");

  useEffect(() => {
    setLang(detectInitialLang());
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((prev) => (prev === "ja" ? "en" : "ja")),
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
