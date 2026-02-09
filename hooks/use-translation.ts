import { useEffect, useState } from "react";
import {
    addLanguageChangeListener,
    changeLanguage as changeI18nLanguage,
    i18n,
} from "../i18n";

/**
 * Hook personalizado para usar traducciones en toda la app
 * @returns Objeto con función t para traducir y función changeLanguage
 *
 * @example
 * const { t, changeLanguage, locale } = useTranslation();
 *
 * // Usar traducciones
 * <Text>{t('common.welcome')}</Text>
 *
 * // Cambiar idioma
 * changeLanguage('es');
 */
export const useTranslation = () => {
  const [locale, setLocale] = useState(i18n.locale);
  const [, forceUpdate] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  // Suscribirse a cambios de idioma
  useEffect(() => {
    const unsubscribe = addLanguageChangeListener((newLocale) => {
      setLocale(newLocale);
      forceUpdate((prev) => prev + 1); // Forzar re-render
    });
    return unsubscribe;
  }, []);

  // Función para traducir con soporte de keys anidadas
  const t = (key: string, params?: Record<string, string | number>): string => {
    return i18n.t(key, params);
  };

  // Función para cambiar el idioma con estado de carga
  const changeLanguage = async (newLocale: "en" | "es") => {
    setIsChanging(true);
    try {
      await changeI18nLanguage(newLocale);
    } finally {
      setIsChanging(false);
    }
  };

  return {
    t,
    locale,
    changeLanguage,
    isChanging,
  };
};
