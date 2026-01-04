import React, { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

// Inline SVG flags (no emojis)
const FlagDE: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="14"
    viewBox="0 0 3 2"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Deutschland</title>
    <rect width="3" height="2" fill="#000" />
    <rect width="3" height="1.333" y="0.666" fill="#DD0000" />
    <rect width="3" height="0.666" y="1.333" fill="#FFCE00" />
  </svg>
);

const FlagUS: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="14"
    viewBox="0 0 7410 3900"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>United States</title>
    <rect width="7410" height="3900" fill="#b22234" />
    <g fill="#fff">
      <rect width="7410" height="300" y="300" />
      <rect width="7410" height="300" y="900" />
      <rect width="7410" height="300" y="1500" />
      <rect width="7410" height="300" y="2100" />
      <rect width="7410" height="300" y="2700" />
      <rect width="7410" height="300" y="3300" />
    </g>
    <rect width="2964" height="2100" fill="#3c3b6e" />
  </svg>
);

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "de", name: "DE", icon: <FlagDE className="w-5 h-4" /> },
    { code: "en", name: "EN", icon: <FlagUS className="w-5 h-4" /> },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-800/80 rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Sprache wechseln"
      >
        <Globe className="w-4 h-4 text-gray-300" />
        {currentLanguage.icon}
        <span className="text-gray-300 font-medium text-sm">
          {currentLanguage.name}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full right-0 mt-1 bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[120px] backdrop-blur">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                role="option"
                aria-selected={language === lang.code}
                className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-gray-800 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                  language === lang.code
                    ? "bg-purple-600 text-white"
                    : "text-gray-300"
                }`}
              >
                {lang.icon}
                <span className="font-medium text-sm">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
