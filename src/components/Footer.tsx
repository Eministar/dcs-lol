import React from "react";
import {Github, Heart, Link2, Mail} from "lucide-react";
import {Link as RLink} from "react-router-dom";

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-[#2a3548]" style={{backgroundColor: '#0d1526'}}>
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <RLink to="/" className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
                                <Link2 className="w-5 h-5 text-primary-foreground"/>
                            </div>
                            <span className="font-display text-2xl tracking-tight text-foreground">
                  dcs<span className="text-primary">.</span>lol
                </span>
                        </RLink>
                        <p className="text-foreground/50 max-w-xs leading-relaxed mb-6">
                            Der schnellste Discord-Link-Shortener. Kostenlos, ohne Limits.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://github.com/Eministar/dcs-lol"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted transition-all"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5 text-foreground/60"/>
                            </a>
                            <a
                                href="mailto:hello@star-dev.xyz"
                                className="p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted transition-all"
                                aria-label="E-Mail"
                            >
                                <Mail className="w-5 h-5 text-foreground/60"/>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Links</h4>
                        <ul className="space-y-3">
                            {[
                                {href: "#features", label: "Features"},
                                {href: "#faq", label: "FAQ"},
                                {href: "https://status.star-dev.xyz", label: "Status", external: true},
                                {href: "https://ko-fi.com/eministarvr", label: "Spenden", external: true},
                            ].map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        target={link.external ? "_blank" : undefined}
                                        rel={link.external ? "noopener noreferrer" : undefined}
                                        className="text-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Rechtliches</h4>
                        <ul className="space-y-3">
                            <li>
                                <RLink
                                    to="/privacy"
                                    className="text-foreground/50 hover:text-foreground transition-colors"
                                >
                                    Datenschutz
                                </RLink>
                            </li>
                            <li>
                                <RLink
                                    to="/tos"
                                    className="text-foreground/50 hover:text-foreground transition-colors"
                                >
                                    Nutzungsbedingungen
                                </RLink>
                            </li>
                            <li>
                                <a href="https://star-dev.xyz/imprint" target="_blank" rel="noopener noreferrer"
                                   className="text-foreground/50 hover:text-foreground transition-colors">
                                    Impressum
                                </a>
                            </li>
                            <li>
                                <a href="https://dcs.lol/dcs" target="_blank" rel="noopener noreferrer"
                                   className="text-foreground/50 hover:text-foreground transition-colors">
                                    Discord Support
                                </a>
                            </li>
                            <li>
                                <RLink
                                    to="/docs/api"
                                    className="text-foreground/50 hover:text-foreground transition-colors"
                                >
                                    API Docs
                                </RLink>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="divider-gradient my-12"/>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-foreground/40">
                        © {currentYear} dcs.lol. Alle Rechte vorbehalten.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-foreground/40">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-current"/>
                        <span>for Communities</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
