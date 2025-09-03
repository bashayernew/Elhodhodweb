import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageOnboarding() {
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem('hodhod_onboarding_done');
    if (!done) setShow(true);
  }, []);

  if (!show) return null;

  const confirm = () => {
    const lang = selected || 'en';
    i18n.changeLanguage(lang);
    localStorage.setItem('hodhod_language', lang);
    localStorage.setItem('hodhod_onboarding_done', '1');
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Select Your Preferred Language</h1>
          <p className="text-sm text-gray-500">You can change the language later in the settings</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => setSelected('ar')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${selected==='ar' ? 'border-hodhod-gold bg-hodhod-gold-light' : 'border-gray-200'}`}
          >
            <span>العربية</span>
            <span className={`w-5 h-5 rounded-full border ${selected==='ar' ? 'bg-hodhod-gold border-hodhod-gold' : 'border-gray-300'}`}></span>
          </button>
          <button
            onClick={() => setSelected('en')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${selected==='en' ? 'border-hodhod-gold bg-hodhod-gold-light' : 'border-gray-200'}`}
          >
            <span>English</span>
            <span className={`w-5 h-5 rounded-full border ${selected==='en' ? 'bg-hodhod-gold border-hodhod-gold' : 'border-gray-300'}`}></span>
          </button>
        </div>
        <button
          onClick={confirm}
          className="mt-6 w-full btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
}


