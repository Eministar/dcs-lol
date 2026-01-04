import React, {useState} from 'react';
import {ChevronDown, ChevronUp, HelpCircle} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';

interface FAQItem {
    id: number;
    question: {
        de: string;
        en: string;
    };
    answer: {
        de: string;
        en: string;
    };
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: {
            de: "Ist dcs.lol wirklich kostenlos?",
            en: "Is dcs.lol really free?"
        },
        answer: {
            de: "Ja, dcs.lol ist komplett kostenlos! Du kannst unbegrenzt viele Discord-Links verkürzen, ohne versteckte Kosten oder Premium-Abos. Wir finanzieren uns durch freiwillige Spenden der Community.",
            en: "Yes, dcs.lol is completely free! You can shorten unlimited Discord links without hidden costs or premium subscriptions. We are funded through voluntary community donations."
        }
    },
    {
        id: 2,
        question: {
            de: "Wie schnell werden meine Links erstellt?",
            en: "How fast are my links created?"
        },
        answer: {
            de: "Deine Links werden in Millisekunden erstellt! Unser System ist darauf optimiert, Discord-Links blitzschnell zu verkürzen und sofort verfügbar zu machen.",
            en: "Your links are created in milliseconds! Our system is optimized to shorten Discord links lightning fast and make them instantly available."
        }
    },
    {
        id: 3,
        question: {
            de: "Kann ich benutzerdefinierte Link-Namen wählen?",
            en: "Can I choose custom link names?"
        },
        answer: {
            de: "Absolut! Du kannst deinen eigenen benutzerdefinierten Namen für jeden Link wählen. So wird aus 'discord.gg/xyz123' einfach 'dcs.lol/meinserver'.",
            en: "Absolutely! You can choose your own custom name for each link. This turns 'discord.gg/xyz123' into simply 'dcs.lol/myserver'."
        }
    },
    {
        id: 4,
        question: {
            de: "Sind meine Links sicher und dauerhaft?",
            en: "Are my links safe and permanent?"
        },
        answer: {
            de: "Ja! Alle Links sind sicher verschlüsselt und dauerhaft verfügbar. Wir überprüfen alle Discord-Links auf Sicherheit und garantieren 99.9% Uptime.",
            en: "Yes! All links are securely encrypted and permanently available. We check all Discord links for security and guarantee 99.9% uptime."
        }
    },
    {
        id: 5,
        question: {
            de: "Kann ich Analytics für meine Links sehen?",
            en: "Can I see analytics for my links?"
        },
        answer: {
            de: "Ja! Du erhältst detaillierte Analytics mit Klick-Zahlen, geografischen Daten, Geräte-Informationen und Conversion-Raten für deine Discord-Server.",
            en: "Yes! You get detailed analytics with click numbers, geographic data, device information and conversion rates for your Discord servers."
        }
    },
    {
        id: 6,
        question: {
            de: "Funktioniert es mit allen Discord-Links?",
            en: "Does it work with all Discord links?"
        },
        answer: {
            de: "dcs.lol funktioniert mit allen Discord-Einladungslinks (discord.gg/... und discord.com/invite/...). Sowohl permanente als auch temporäre Einladungen werden unterstützt.",
            en: "dcs.lol works with all Discord invitation links (discord.gg/... and discord.com/invite/...). Both permanent and temporary invitations are supported."
        }
    },
    {
        id: 7,
        question: {
            de: "Gibt es ein Limit für die Anzahl der Links?",
            en: "Is there a limit to the number of links?"
        },
        answer: {
            de: "Nein! Du kannst unbegrenzt viele Links erstellen. Es gibt keine Beschränkungen bei der Anzahl der Links oder Klicks.",
            en: "No! You can create unlimited links. There are no restrictions on the number of links or clicks."
        }
    },
    {
        id: 8,
        question: {
            de: "Wie kann ich dcs.lol unterstützen?",
            en: "How can I support dcs.lol?"
        },
        answer: {
            de: "Da dcs.lol kostenlos ist, freuen wir uns über freiwillige Spenden über Ko-fi. Du kannst uns auch helfen, indem du dcs.lol in deiner Community teilst!",
            en: "Since dcs.lol is free, we appreciate voluntary donations via Ko-fi. You can also help us by sharing dcs.lol in your community!"
        }
    }
];

export const FAQ: React.FC = () => {
    const {t, language} = useLanguage();
    const [openItems, setOpenItems] = useState<number[]>([]);

    const toggleItem = (id: number) => {
        setOpenItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    return (
        <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <div className="flex justify-center mb-8">
                        <div
                            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <HelpCircle className="w-8 h-8 text-white"/>
                        </div>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black mb-6">
                        {t('faqTitle')} <span
                        className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t('faqSubtitle')}</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        {t('faqDescription')}
                    </p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <div
                            key={item.id}
                            className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 hover:border-blue-500/50"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: 'slideInUp 0.6s ease-out forwards'
                            }}
                        >
                            <button
                                onClick={() => toggleItem(item.id)}
                                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors duration-200"
                            >
                                <h3 className="text-xl font-bold text-white pr-8">
                                    {item.question[language as keyof typeof item.question]}
                                </h3>
                                <div className="flex-shrink-0">
                                    {openItems.includes(item.id) ? (
                                        <ChevronUp className="w-6 h-6 text-blue-400"/>
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-gray-400"/>
                                    )}
                                </div>
                            </button>

                            {openItems.includes(item.id) && (
                                <div className="px-8 pb-6">
                                    <div className="border-t border-gray-700/50 pt-6">
                                        <p className="text-gray-300 text-lg leading-relaxed">
                                            {item.answer[language as keyof typeof item.answer]}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="text-center mt-16">
                    <div
                        className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            {t('stillQuestions')}
                        </h3>
                        <p className="text-gray-300 mb-6">
                            {t('supportTeam')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://dcs.lol/dcs"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1"
                            >
                                {t('discordSupport')}
                            </a>
                            <a
                                href="mailto:hello@star-dev.xyz"
                                className="bg-gray-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-600 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
                            >
                                {t('emailSupport')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};