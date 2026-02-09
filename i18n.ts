import { I18n } from "i18n-js";
import en from "./locales/en.json";
import es from "./locales/es.json";

// Crear instancia de i18n
export const i18n = new I18n({
  en,
  es,
});

// Configurar el locale por defecto
i18n.locale = "en";

// Habilitar fallback al inglés si no encuentra una traducción
i18n.enableFallback = true;
i18n.defaultLocale = "en";

// Sistema de listeners para cambios de idioma
type LanguageChangeListener = (locale: string) => void;
const languageChangeListeners: Set<LanguageChangeListener> = new Set();

// Estado para prevenir cambios simultáneos
let isChangingLanguage = false;

export const addLanguageChangeListener = (listener: LanguageChangeListener) => {
  languageChangeListeners.add(listener);
  return () => languageChangeListeners.delete(listener);
};

// Función para verificar si hay un cambio en proceso
export const isLanguageChanging = (): boolean => {
  return isChangingLanguage;
};

// Función para cambiar el idioma manualmente con protección contra cambios simultáneos
export const changeLanguage = async (locale: "en" | "es"): Promise<boolean> => {
  // Prevenir cambios simultáneos
  if (isChangingLanguage) {
    console.log("Language change already in progress, ignoring request");
    return false;
  }

  // Verificar si ya estamos en ese idioma
  if (i18n.locale === locale) {
    console.log(`Already in ${locale}, skipping change`);
    return true;
  }

  try {
    isChangingLanguage = true;
    i18n.locale = locale;

    // Notificar a todos los listeners
    languageChangeListeners.forEach((listener) => listener(locale));

    // Pequeño delay para asegurar que todos los componentes se actualicen
    await new Promise((resolve) => setTimeout(resolve, 100));

    return true;
  } catch (error) {
    console.error("Error changing language:", error);
    return false;
  } finally {
    isChangingLanguage = false;
  }
};

// Función para obtener el idioma actual
export const getCurrentLanguage = (): string => {
  return i18n.locale;
};

// Tipos para autocompletado
export type TranslationKeys = typeof en;
