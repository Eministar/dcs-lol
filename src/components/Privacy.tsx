import React from 'react';
import { X, Shield, Eye, Database, Lock, Globe, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PrivacyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Privacy: React.FC<PrivacyProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const privacyContent = {
    de: {
      intro: 'Bei dcs.lol nehmen wir deinen Datenschutz ernst. Diese Erklärung zeigt, wie wir mit deinen Daten umgehen.',
      dataCollectionItems: [
        'Discord URLs: Die ursprünglichen Links, die du verkürzen möchtest',
        'IP-Adressen: Zur Spam-Prävention und Sicherheit (anonymisiert nach 30 Tagen)',
        'Browser-Informationen: Grundlegende technische Daten für Kompatibilität',
        'Klick-Statistiken: Anonyme Zählung der Link-Aufrufe'
      ],
      dataUsageItems: [
        'Service-Bereitstellung: Um deine Links zu verkürzen und weiterzuleiten',
        'Spam-Schutz: Zur Erkennung und Verhinderung von Missbrauch',
        'Service-Verbesserung: Anonyme Statistiken zur Optimierung',
        'Sicherheit: Schutz vor schädlichen Links und Betrug'
      ],
      dataProtectionItems: [
        'Verschlüsselung: Alle Daten werden verschlüsselt übertragen (HTTPS)',
        'Minimierung: Wir sammeln nur notwendige Daten',
        'Anonymisierung: Persönliche Daten werden nach 30 Tagen anonymisiert',
        'Sichere Server: Hosting in Deutschland mit höchsten Sicherheitsstandards'
      ],
      dataSharingItems: [
        'Grundsätzlich NEIN: Wir verkaufen oder vermieten deine Daten nicht',
        'Ausnahmen: Nur bei rechtlichen Verpflichtungen oder Sicherheitsbedrohungen',
        'Service-Partner: Minimale technische Daten für Hosting und CDN',
        'Anonyme Statistiken: Nur aggregierte, nicht-personenbezogene Daten'
      ],
      rightsItems: [
        'Auskunft: Du kannst jederzeit fragen, welche Daten wir haben',
        'Löschung: Du kannst die Löschung deiner Daten verlangen',
        'Berichtigung: Falsche Daten können korrigiert werden',
        'Widerspruch: Du kannst der Datenverarbeitung widersprechen'
      ],
      contactText: 'Bei Fragen oder Anliegen zum Datenschutz kannst du uns jederzeit kontaktieren:',
      contactInfo: [
        '📧 E-Mail: info@dcs.lol',
        '💬 Discord: dcs.lol/dcs',
      
      ]
    },
    en: {
      intro: 'At dcs.lol we take your privacy seriously. This policy explains how we handle your data.',
      dataCollectionItems: [
        'Discord URLs: The original links you want to shorten',
        'IP addresses: For spam prevention and security (anonymized after 30 days)',
        'Browser information: Basic technical data for compatibility',
        'Click statistics: Anonymous counting of link visits'
      ],
      dataUsageItems: [
        'Service provision: To shorten and redirect your links',
        'Spam protection: To detect and prevent abuse',
        'Service improvement: Anonymous statistics for optimization',
        'Security: Protection against malicious links and fraud'
      ],
      dataProtectionItems: [
        'Encryption: All data is transmitted encrypted (HTTPS)',
        'Minimization: We only collect necessary data',
        'Anonymization: Personal data is anonymized after 30 days',
        'Secure servers: Hosting in Germany with highest security standards'
      ],
      dataSharingItems: [
        'Generally NO: We do not sell or rent your data',
        'Exceptions: Only for legal obligations or security threats',
        'Service partners: Minimal technical data for hosting and CDN',
        'Anonymous statistics: Only aggregated, non-personal data'
      ],
      rightsItems: [
        'Information: You can ask what data we have at any time',
        'Deletion: You can request deletion of your data',
        'Correction: Incorrect data can be corrected',
        'Objection: You can object to data processing'
      ],
      contactText: 'For questions or concerns about privacy, you can contact us at any time:',
      contactInfo: [
        '📧 Email: info@dcs.lol',
        '💬 Discord: dcs.lol/dcs',
        
      ]
    }
  };

  const content = privacyContent[language as keyof typeof privacyContent];

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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">{t('privacyTitle')}</h2>
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
                {content.intro}
              </p>
            </div>

            {/* Data Collection */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">{t('dataCollection')}</h3>
              </div>
              <div className="space-y-3 text-gray-300">
                {content.dataCollectionItems.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))}
              </div>
            </div>

            {/* Data Usage */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-6 h-6 text-green-400" />
                <h3 className="text-2xl font-bold text-white">{t('dataUsage')}</h3>
              </div>
              <div className="space-y-3 text-gray-300">
                {content.dataUsageItems.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))}
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-6 h-6 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">{t('dataProtection')}</h3>
              </div>
              <div className="space-y-3 text-gray-300">
                {content.dataProtectionItems.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))}
              </div>
            </div>

            {/* Data Sharing */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-orange-400" />
                <h3 className="text-2xl font-bold text-white">{t('dataSharing')}</h3>
              </div>
              <div className="space-y-3 text-gray-300">
                {content.dataSharingItems.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))}
              </div>
            </div>

            {/* Rights */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h3 className="text-2xl font-bold text-white">{t('yourRights')}</h3>
              </div>
              <div className="space-y-3 text-gray-300">
                {content.rightsItems.map((item, index) => (
                  <p key={index}>• {item}</p>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">{t('privacyContact')}</h3>
              <p className="text-gray-300 mb-4">
                {content.contactText}
              </p>
              <div className="space-y-2 text-gray-300">
                {content.contactInfo.map((info, index) => (
                  <p key={index}>{info}</p>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center pt-8 border-t border-gray-700">
              <p className="text-gray-500">
                {t('lastUpdated')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};