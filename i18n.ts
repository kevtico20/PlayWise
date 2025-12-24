import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './locales/en.json';
import es from './locales/es.json';

// Crear instancia de i18n
export const i18n = new I18n({
  en,
  es,
});

// Configurar el locale por defecto
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';

// Habilitar fallback al inglés si no encuentra una traducción
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Función para cambiar el idioma manualmente
export const changeLanguage = (locale: 'en' | 'es') => {
  i18n.locale = locale;
};

// Función para obtener el idioma actual
export const getCurrentLanguage = (): string => {
  return i18n.locale;
};

// Tipos para autocompletado
export type TranslationKeys = typeof en;
