import { useState } from 'react';
import { changeLanguage as changeI18nLanguage, i18n } from '../i18n';

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

  // Función para traducir con soporte de keys anidadas
  const t = (key: string, params?: Record<string, string | number>): string => {
    return i18n.t(key, params);
  };

  // Función para cambiar el idioma
  const changeLanguage = (newLocale: 'en' | 'es') => {
    changeI18nLanguage(newLocale);
    setLocale(newLocale);
  };

  return {
    t,
    locale,
    changeLanguage,
  };
};
