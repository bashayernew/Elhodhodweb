import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('hodhod_language') || 'en';
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('hodhod_language', language);
    
    // Update document direction for RTL support
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    changeLanguage(newLanguage);
  };

  const isRTL = currentLanguage === 'ar';

  const value = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
