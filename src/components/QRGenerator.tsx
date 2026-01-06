import React, {useEffect, useState} from "react";
import {CheckCircle, Copy, Download, QrCode, Share2, Sparkles, X, Zap} from "lucide-react";
import QRCodeLib from "qrcode";

interface QRGeneratorProps {
    url?: string;
    isOpen: boolean;
    onClose: () => void;
}

const qrStyles = [
    {id: "default", name: "Standard", colors: {dark: "#0a0f0d", light: "#FFFFFF"}},
    {id: "primary", name: "Primary", colors: {dark: "#34d399", light: "#0a0f0d"}},
    {id: "blue", name: "Ocean Blue", colors: {dark: "#38bdf8", light: "#0c1525"}},
    {id: "purple", name: "Discord", colors: {dark: "#5865F2", light: "#1e1f2e"}},
    {id: "pink", name: "Neon Pink", colors: {dark: "#f472b6", light: "#1a0d13"}},
    {id: "dark", name: "Inverted", colors: {dark: "#f1f5f9", light: "#0a0f0d"}},
];

export const QRGenerator: React.FC<QRGeneratorProps> = ({url, isOpen, onClose}) => {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [customUrl, setCustomUrl] = useState(url || "");
    const [qrStyle, setQrStyle] = useState("primary");
    const [qrSize, setQrSize] = useState(512);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (customUrl && isOpen) {
            generateQR();
        }
    }, [customUrl, qrStyle, qrSize, isOpen]);

    const generateQR = async () => {
        if (!customUrl) return;
        try {
            const style = qrStyles.find((s) => s.id === qrStyle) || qrStyles[0];
            const dataUrl = await QRCodeLib.toDataURL(customUrl, {
                width: qrSize,
                margin: 2,
                color: {dark: style.colors.dark, light: style.colors.light},
                errorCorrectionLevel: "M",
            });
            setQrDataUrl(dataUrl);
        } catch (error) {
            console.error("QR Code generation failed:", error);
        }
    };

    const downloadQR = async () => {
        if (!qrDataUrl) return;
        setDownloading(true);
        try {
            const link = document.createElement("a");
            link.download = `dcs-lol-qr-${Date.now()}.png`;
            link.href = qrDataUrl;
            link.click();
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setDownloading(false);
        }
    };

    const copyQRImage = async () => {
        if (!qrDataUrl) return;
        try {
            const response = await fetch(qrDataUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([new ClipboardItem({"image/png": blob})]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose}/>

            <div
                className="relative w-full max-w-4xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden card-glow">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-primary"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">QR Code Generator</h2>
                            <p className="text-foreground/50 text-sm">Stylische QR Codes für deine Links</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-xl btn-secondary">
                        <X className="w-5 h-5 text-foreground"/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Settings */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-foreground font-semibold mb-3">Link URL</label>
                                <input
                                    type="text"
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    placeholder="https://dcs.lol/meinserver"
                                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground input-glow focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-foreground font-semibold mb-3">Style</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {qrStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setQrStyle(style.id)}
                                            className={`p-3 rounded-xl border-2 transition-all ${
                                                qrStyle === style.id
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:border-primary/30"
                                            }`}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-lg mx-auto mb-2 border border-border"
                                                style={{backgroundColor: style.colors.dark}}
                                            />
                                            <span className="text-xs text-foreground/70">{style.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-foreground font-semibold mb-3">Größe: {qrSize}px</label>
                                <input
                                    type="range"
                                    min="256"
                                    max="1024"
                                    step="128"
                                    value={qrSize}
                                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                                    className="w-full h-2 bg-card rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <button
                                onClick={generateQR}
                                disabled={!customUrl}
                                className="w-full py-3 rounded-xl btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Zap className="w-5 h-5"/>
                                QR Code generieren
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary"/>
                                    Vorschau
                                </h3>

                                {qrDataUrl ? (
                                    <div className="bg-card p-6 rounded-2xl inline-block border border-border">
                                        <img src={qrDataUrl} alt="QR Code" className="max-w-full h-auto rounded-xl"
                                             style={{maxWidth: "240px"}}/>
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-border rounded-2xl p-12 text-center bg-card/50">
                                        <QrCode className="w-12 h-12 text-foreground/30 mx-auto mb-3"/>
                                        <p className="text-foreground/40">QR Code wird hier angezeigt</p>
                                    </div>
                                )}
                            </div>

                            {qrDataUrl && (
                                <>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={downloadQR}
                                            disabled={downloading}
                                            className="flex-1 py-3 rounded-xl btn-primary flex items-center justify-center gap-2"
                                        >
                                            {downloading ? (
                                                <div
                                                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"/>
                                            ) : (
                                                <Download className="w-5 h-5"/>
                                            )}
                                            Download
                                        </button>
                                        <button
                                            onClick={copyQRImage}
                                            className="flex-1 py-3 rounded-xl btn-secondary flex items-center justify-center gap-2"
                                        >
                                            {copied ? <CheckCircle className="w-5 h-5"/> : <Copy className="w-5 h-5"/>}
                                            {copied ? "Kopiert!" : "Kopieren"}
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-xl bg-card border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Share2 className="w-4 h-4 text-primary"/>
                                            <span className="font-semibold text-foreground text-sm">Tipp</span>
                                        </div>
                                        <p className="text-foreground/50 text-sm">
                                            Teile diesen QR Code auf Flyern, Postern oder Social Media. Ein Scan führt
                                            direkt zu deinem Discord-Server!
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
