import React from "react";
import {Globe, Link2, Shield, Smartphone, Users, Zap} from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Blitzschnell",
        description: "Links werden in Millisekunden erstellt und weitergeleitet.",
        gradient: "from-yellow-500/20 to-orange-500/20",
        iconColor: "text-yellow-400",
    },
    {
        icon: Shield,
        title: "Sicher & Privat",
        description: "Alle Links sind verschlüsselt. 99.9% Uptime garantiert.",
        gradient: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-blue-400",
    },
    {
        icon: Link2,
        title: "Custom Names",
        description: "Wähle eigene Namen für deine Links: dcs.lol/dein-name",
        gradient: "from-primary/20 to-accent/20",
        iconColor: "text-primary",
    },
    {
        icon: Smartphone,
        title: "Mobile-First",
        description: "Perfekt optimiert für alle Geräte und Plattformen.",
        gradient: "from-purple-500/20 to-pink-500/20",
        iconColor: "text-purple-400",
    },
    {
        icon: Globe,
        title: "Weltweit verfügbar",
        description: "Schnelle Redirects dank globaler Infrastruktur.",
        gradient: "from-emerald-500/20 to-teal-500/20",
        iconColor: "text-emerald-400",
    },
    {
        icon: Users,
        title: "Für Discord",
        description: "Speziell für Discord-Communities entwickelt.",
        gradient: "from-indigo-500/20 to-blue-500/20",
        iconColor: "text-indigo-400",
    },
];

export const Features: React.FC = () => {
    return (
        <section id="features" className="py-24 md:py-32 relative" style={{backgroundColor: '#0b1120'}}>
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px]"/>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px]"/>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
                        <span className="text-sm text-foreground/70">Unsere Features</span>
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
                        Warum <span className="gradient-text">dcs.lol</span>?
                    </h2>
                    <p className="text-lg text-foreground/50 max-w-2xl mx-auto text-balance">
                        Der beste Discord-Link-Shortener. Punkt.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 card-glow overflow-hidden"
                            style={{animationDelay: `${index * 100}ms`}}
                        >
                            {/* Gradient background on hover */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}/>

                            <div className="relative z-10">
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`}/>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-foreground/50 leading-relaxed group-hover:text-foreground/70 transition-colors">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
