import React from "react";
import {Link as RLink} from "react-router-dom";
import {ArrowRight, Code2, Lock, Zap} from "lucide-react";
import {useLanguage} from "../contexts/LanguageContext";

export const ApiSection: React.FC = () => {
    const {t} = useLanguage();

    const features = [
        {
            icon: Zap,
            titleDe: "Keine Rate Limits",
            titleEn: "No Rate Limits",
            descDe: "Unbegrenzte Anfragen für alle Endpoints",
            descEn: "Unlimited requests for all endpoints"
        },
        {
            icon: Lock,
            titleDe: "Keine API-Keys",
            titleEn: "No API Keys",
            descDe: "Sofort loslegen ohne Registrierung",
            descEn: "Start immediately without registration"
        },
        {
            icon: Code2,
            titleDe: "RESTful JSON API",
            titleEn: "RESTful JSON API",
            descDe: "Einfache Integration in jede Anwendung",
            descEn: "Easy integration into any application"
        }
    ];

    const isDE = t("common.back") === "Zurück";

    return (
        <section id="api" className="relative py-24 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                        <Code2 className="w-4 h-4 text-accent"/>
                        <span className="text-sm text-accent font-medium">
                            {isDE ? "Für Entwickler" : "For Developers"}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
                        {isDE ? "Öffentliche API" : "Public API"}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {isDE
                            ? "Voller Zugriff auf alle Links, Statistiken und Discord-Server-Informationen. Kostenlos und ohne Einschränkungen."
                            : "Full access to all links, statistics, and Discord server information. Free and without restrictions."}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {features.map((feature) => (
                        <div
                            key={feature.titleEn}
                            className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
                        >
                            <div
                                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="w-6 h-6 text-primary"/>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                {isDE ? feature.titleDe : feature.titleEn}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {isDE ? feature.descDe : feature.descEn}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Code Example */}
                <div className="bg-card border border-border rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground font-mono">
                            {isDE ? "Beispiel-Anfrage" : "Example Request"}
                        </span>
                        <span
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                            GET
                        </span>
                    </div>
                    <pre className="text-sm font-mono text-primary overflow-x-auto">
{`fetch('https://dcs.lol/api/v1/stats')
  .then(res => res.json())
  .then(data => console.log(data));

// Response:
// { success: true, data: { totalLinks: 1234, totalClicks: 56789, ... } }`}
                    </pre>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <RLink
                        to="/docs/api"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-base font-medium group"
                    >
                        {isDE ? "API Dokumentation" : "API Documentation"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                    </RLink>
                    <p className="mt-4 text-sm text-muted-foreground">
                        {isDE
                            ? "16+ Endpoints • Vollständige Dokumentation • Code-Beispiele"
                            : "16+ Endpoints • Complete Documentation • Code Examples"}
                    </p>
                </div>
            </div>
        </section>
    );
};

