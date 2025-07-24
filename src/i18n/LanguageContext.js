import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from './translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Intentar obtener el idioma guardado del localStorage
    const savedLanguage = localStorage.getItem('iracing-setup-language');
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Si no hay idioma guardado, detectar el idioma del navegador
    const browserLanguage = navigator.language || navigator.userLanguage;
    if (browserLanguage.startsWith('es')) {
      return 'es';
    }
    return 'en'; // Por defecto inglés
  });

  // Guardar el idioma en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('iracing-setup-language', language);
  }, [language]);

  const t = (key, ...args) => {
    const translation = getTranslation(language, key);
    if (args.length === 0) {
      return translation;
    }
    // Soporte para interpolación de variables
    return args.reduce((str, arg, index) => {
      return str.replace(`{${index}}`, arg);
    }, translation);
  };

  const changeLanguage = (newLanguage) => {
    if (newLanguage === 'es' || newLanguage === 'en') {
      setLanguage(newLanguage);
    }
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;