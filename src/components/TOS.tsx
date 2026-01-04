import React from 'react';
import { X, FileText, AlertCircle, Lock, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TermsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Terms: React.FC<TermsProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  // Ziehe alle Terms-Strings aus dem Übersetzungs-Context
  const intro = t('termsIntro');
  const title = t('termsTitle');
  const lastUpdated = t('termsLastUpdated');
  const items = [
    t('terms1'),
    t('terms2'),
    t('terms3'),
    t('terms4'),
    t('terms5'),
    t('terms6'),
    t('terms7'),
    t('terms8'),
    t('terms9'),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-8">
            {/* Intro */}
            <div className="text-center mb-12">
              <p className="text-xl text-gray-300 leading-relaxed">
                {intro}
              </p>
            </div>

            {/* Terms List */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-2xl font-bold text-white">{title}</h3>
              </div>
              <div className="space-y-3 text-gray-300">
                {items.map((line, idx) => (
                  <p key={idx}>• {line}</p>
                ))}
              </div>
            </div>

            {/* Footer / Last Updated */}
            <div className="text-center pt-8 border-t border-gray-700">
              <p className="text-gray-500">{lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
