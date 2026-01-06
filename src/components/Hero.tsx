import React, {useState} from "react";
import {AlertCircle, CheckCircle, Copy, ExternalLink, Info, QrCode, Webhook, Zap} from "lucide-react";
import {QRGenerator} from "./QRGenerator";
import {WebhookManager} from "./WebhookManager";
import {useAuth} from "../contexts/AuthContext";
import {Link as RLink} from "react-router-dom";

export const Hero: React.FC = () => {
    const {user} = useAuth();
    const [inputUrl, setInputUrl] = useState("");
    const [customId, setCustomId] = useState("");
    const [shortenedUrl, setShortenedUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const [showQRGenerator, setShowQRGenerator] = useState(false);
    const [showWebhookManager, setShowWebhookManager] = useState(false);

    const validateDiscordUrl = (url: string): boolean => {
        const discordPatterns = [
            /^https:\/\/discord\.gg\/[a-zA-Z0-9]+$/,
            /^https:\/\/discord\.com\/invite\/[a-zA-Z0-9]+$/,
            /^discord\.gg\/[a-zA-Z0-9]+$/,
        ];
        return discordPatterns.some((pattern) => pattern.test(url));
    };

    const shortenUrl = async () => {
        if (!inputUrl.trim()) {
            setError("Bitte gib einen Discord-Link ein");
            return;
        }
        if (!validateDiscordUrl(inputUrl)) {
            setError("Nur Discord-Invite-Links sind erlaubt");
            return;
        }
        if (!customId.trim()) {
            setError("Bitte wähle einen Custom-Namen");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/shorten", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({originalUrl: inputUrl, customId: customId}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Unbekannter Fehler");
            setShortenedUrl(data.short);
            try {
                window.dispatchEvent(new Event("link-created"));
            } catch (e) {
                // Nicht kritisch: kann in manchen Browser-/Embed-Kontexten fehlschlagen
                console.debug('link-created event dispatch failed', e);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ein Fehler ist aufgetreten");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(shortenedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <section
                className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-28 pb-16"
                style={{backgroundColor: '#0b1120'}}>
                {/* Background layers */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Primary glow */}
                    <div
                        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px] animate-float"/>
                    {/* Accent glow */}
                    <div
                        className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[150px] animate-float delay-200"/>
                    {/* dunkles Overlay statt Aufheller */}
                    <div className="absolute inset-0 bg-black/30"/>
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.08] bg-grid"/>
                    <div className="absolute inset-0 noise pointer-events-none"/>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/20 mb-8 animate-fade-up">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"/>
                        <span className="text-sm text-foreground/80">Kostenlos & ohne Limits</span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6 animate-fade-up delay-100">
                        <span className="text-foreground">Discord Links,</span>
                        <br/>
                        <span className="gradient-text text-glow">kurz gemacht.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-8 animate-fade-up delay-200 text-balance">
                        Verwandle lange Discord-Einladungen in elegante Kurzlinks.
                        Aus discord.gg/xyz wird <span
                        className="text-primary font-mono font-medium">dcs.lol/dein-name</span>
                    </p>

                    {/* Account Warning */}
                    {!user && (
                        <div className="max-w-2xl mx-auto mb-8 animate-fade-up delay-300">
                            <div
                                className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
                                <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0"/>
                                <p className="text-amber-200/90 text-sm">
                                    <strong className="text-amber-100">Tipp:</strong> Mit einem Account kannst du deine
                                    Links später bearbeiten.{" "}
                                    <RLink to="/register" className="underline hover:text-amber-100 transition-colors">Jetzt
                                        registrieren</RLink>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="max-w-2xl mx-auto animate-fade-up delay-300">
                        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border card-glow">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={inputUrl}
                                    onChange={(e) => setInputUrl(e.target.value)}
                                    placeholder="discord.gg/dein-server oder discord.com/invite/..."
                                    className="w-full px-5 py-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground input-glow focus:outline-none transition-all"
                                />
                                <input
                                    type="text"
                                    value={customId}
                                    onChange={(e) => setCustomId(e.target.value)}
                                    placeholder="Dein Wunsch-Name (z.B. meinserver)"
                                    className="w-full px-5 py-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground input-glow focus:outline-none transition-all"
                                />

                                {error && (
                                    <div
                                        className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                                        <AlertCircle className="w-4 h-4"/>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={shortenUrl}
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-xl btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <div
                                            className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"/>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5"/>
                                            <span>Link kürzen</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Result */}
                            {shortenedUrl && (
                                <div className="mt-6 p-6 rounded-2xl bg-primary/10 border border-primary/30">
                                    <div className="flex items-center gap-2 text-primary mb-3">
                                        <CheckCircle className="w-5 h-5"/>
                                        <span className="font-semibold">Dein Kurzlink ist bereit!</span>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <code
                                            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border font-mono text-primary text-sm md:text-base truncate">
                                            {shortenedUrl}
                                        </code>
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-3 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-all"
                                        >
                                            {copied ? <CheckCircle className="w-5 h-5 text-primary"/> :
                                                <Copy className="w-5 h-5 text-primary"/>}
                                        </button>
                                        <a
                                            href={shortenedUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-all"
                                        >
                                            <ExternalLink className="w-5 h-5 text-primary"/>
                                        </a>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowQRGenerator(true)}
                                            className="flex-1 py-3 rounded-xl btn-secondary flex items-center justify-center gap-2"
                                        >
                                            <QrCode className="w-4 h-4"/>
                                            <span>QR-Code</span>
                                        </button>
                                        <button
                                            onClick={() => setShowWebhookManager(true)}
                                            className="flex-1 py-3 rounded-xl btn-secondary flex items-center justify-center gap-2"
                                        >
                                            <Webhook className="w-4 h-4"/>
                                            <span>Webhooks</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-up delay-400">
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-display gradient-text">100+</p>
                            <p className="text-sm text-foreground/50 mt-1">Links erstellt</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-display gradient-text">99.9%</p>
                            <p className="text-sm text-foreground/50 mt-1">Uptime</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-display gradient-text">∞</p>
                            <p className="text-sm text-foreground/50 mt-1">Kostenlos</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modals */}
            <QRGenerator url={shortenedUrl} isOpen={showQRGenerator} onClose={() => setShowQRGenerator(false)}/>
            <WebhookManager isOpen={showWebhookManager} onClose={() => setShowWebhookManager(false)}/>
        </>
    );
};
