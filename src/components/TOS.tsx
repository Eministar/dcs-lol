import React from "react";
import {AlertCircle, FileText, X} from "lucide-react";

interface TermsProps {
    isOpen: boolean;
    onClose: () => void;
}

const termsItems = [
    "dcs.lol ist ein kostenloser Discord-Link-Shortener.",
    "Der Service darf nur für legale Zwecke verwendet werden.",
    "Spam, Phishing oder schädliche Inhalte sind verboten.",
    "Wir behalten uns das Recht vor, Links jederzeit zu entfernen.",
    "Der Service wird ohne Garantie bereitgestellt.",
    "Wir haften nicht für Ausfälle oder Datenverluste.",
    "Die Nutzung erfolgt auf eigenes Risiko.",
    "Diese Bedingungen können jederzeit geändert werden.",
    "Bei Verstoß kann der Zugang gesperrt werden.",
];

export const Terms: React.FC<TermsProps> = ({isOpen, onClose}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}/>

            <div
                className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary"/>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Nutzungsbedingungen</h2>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-xl bg-secondary hover:bg-muted transition-colors">
                        <X className="w-5 h-5 text-foreground"/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div className="space-y-6">
                        <p className="text-muted-foreground text-center">
                            Durch die Nutzung von dcs.lol erklärst du dich mit diesen Bedingungen einverstanden.
                        </p>

                        <div className="p-6 rounded-2xl bg-card border border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="w-5 h-5 text-destructive"/>
                                <h3 className="text-lg font-semibold text-foreground">Nutzungsbedingungen</h3>
                            </div>
                            <div className="space-y-3 text-muted-foreground">
                                {termsItems.map((item, idx) => (
                                    <p key={idx}>• {item}</p>
                                ))}
                            </div>
                        </div>

                        <div className="text-center pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">Zuletzt aktualisiert: Januar 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
