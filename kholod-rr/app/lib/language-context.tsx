import { createContext, useContext } from "react";
import type { Language } from "./i18n";

type LanguageContextValue = {
  language: Language;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  return (
    <LanguageContext.Provider value={{ language }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
