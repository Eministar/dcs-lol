import React, {useState} from "react";
import {ChevronDown, HelpCircle} from "lucide-react";

const faqs = [
    {
        question: "Ist dcs.lol wirklich kostenlos?",
        answer: "Ja, komplett kostenlos! Du kannst unbegrenzt viele Discord-Links verkürzen. Wir finanzieren uns durch freiwillige Spenden.",
    },
    {
        question: "Wie schnell werden meine Links erstellt?",
        answer: "In Millisekunden! Unser System ist optimiert für blitzschnelle Erstellung und sofortige Verfügbarkeit.",
    },
    {
        question: "Kann ich benutzerdefinierte Namen wählen?",
        answer: "Ja! Wähle eigene Namen für jeden Link. Aus discord.gg/xyz wird dcs.lol/dein-wunschname.",
    },
    {
        question: "Sind meine Links sicher und dauerhaft?",
        answer: "Alle Links sind verschlüsselt und dauerhaft verfügbar. Wir garantieren 99.9% Uptime.",
    },
    {
        question: "Funktioniert es mit allen Discord-Links?",
        answer: "Ja! Sowohl discord.gg/... als auch discord.com/invite/... Links werden unterstützt.",
    },
    {
        question: "Gibt es ein Limit für die Anzahl der Links?",
        answer: "Nein! Erstelle unbegrenzt viele Links ohne Beschränkungen.",
    },
];

export const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 md:py-32 relative" style={{backgroundColor: '#0b1120'}}>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px]"/>
                <div className="absolute top-1/4 left-0 w-72 h-72 bg-accent/5 rounded-full blur-[120px]"/>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 mb-6">
                        <HelpCircle className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
                        Häufige Fragen
                    </h2>
                    <p className="text-lg text-foreground/50">
                        Alles, was du wissen musst.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl bg-card border transition-all duration-300 ${
                                openIndex === index ? "border-primary/40" : "border-border"
                            }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors rounded-2xl"
                            >
                <span className="font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${
                                        openIndex === index ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-200 ${
                                    openIndex === index ? "max-h-96" : "max-h-0"
                                }`}
                            >
                                <p className="px-6 pb-6 text-foreground/60 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-16 p-8 rounded-2xl bg-card border border-border text-center card-glow">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        Noch Fragen?
                    </h3>
                    <p className="text-foreground/50 mb-6">
                        Unser Support-Team hilft dir gerne weiter.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://dcs.lol/dcs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-xl btn-primary"
                        >
                            Discord Support
                        </a>
                        <a
                            href="mailto:hello@star-dev.xyz"
                            className="px-6 py-3 rounded-xl btn-secondary font-semibold"
                        >
                            E-Mail schreiben
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
