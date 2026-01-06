import React from "react";
import {ArrowRight, Heart, Sparkles, Zap} from "lucide-react";

export const CTA: React.FC = () => {
    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <section className="py-24 md:py-32" style={{backgroundColor: '#0b1120'}}>
            <div className="max-w-5xl mx-auto px-6">
                <div className="relative p-12 md:p-16 rounded-3xl overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-[#131c2e] to-accent/15"/>
                    <div className="absolute inset-0 border border-primary/30 rounded-3xl"/>
                    {/* Glow effects */}
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"/>
                    <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/15 rounded-full blur-[80px]"/>
                    <div className="absolute inset-0 noise pointer-events-none"/>

                    <div className="relative z-10 text-center">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-8">
                            <Sparkles className="w-4 h-4 text-primary"/>
                            <span className="text-sm text-primary font-medium">Jetzt starten</span>
                        </div>

                        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                            Bereit, loszulegen?
                        </h2>
                        <p className="text-lg text-foreground/60 max-w-xl mx-auto mb-10 text-balance">
                            Erstelle deinen ersten Kurzlink in Sekunden. Kostenlos, ohne Anmeldung.
                        </p>

                        <button
                            onClick={scrollToTop}
                            className="px-8 py-4 rounded-xl btn-primary flex items-center gap-2 mx-auto group"
                        >
                            <Zap className="w-5 h-5"/>
                            <span>Link kürzen</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>

                    {/* Features */}
                    <div className="relative z-10 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {icon: Zap, title: "Blitzschnell", desc: "Links in Millisekunden"},
                            {icon: Sparkles, title: "Einfach", desc: "Keine Anmeldung nötig"},
                            {icon: Heart, title: "Community", desc: "Für Discord-Lover"},
                        ].map((item) => (
                            <div key={item.title}
                                 className="p-6 rounded-2xl bg-card border border-border text-center backdrop-blur-sm">
                                <item.icon className="w-8 h-8 text-primary mx-auto mb-4"/>
                                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-foreground/50">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Trust Indicators */}
                    <div
                        className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-foreground/50">
                        {["99.9% Uptime", "100+ Links erstellt", "25+ Communities"].map((text) => (
                            <div key={text} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"/>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
