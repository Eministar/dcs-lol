import React, {useEffect, useMemo, useState} from "react";
import {useAuth} from "../contexts/AuthContext";
import {AlertCircle, Link2, LogIn, Shield} from "lucide-react";
import {Link as RLink, useLocation} from "react-router-dom";

const Login: React.FC = () => {
    const {login} = useAuth();
    const location = useLocation();
    const initialError = useMemo(() => new URLSearchParams(location.search).get("error") || "", [location.search]);
    const [error, setError] = useState(initialError);

    useEffect(() => {
        if (initialError) {
            const url = new URL(window.location.href);
            url.searchParams.delete("error");
            window.history.replaceState(null, "", url.toString());
        }
    }, [initialError]);

    const errorText = useMemo(() => {
        if (!error) return "";
        switch (error) {
            case "oauth_missing_code":
                return "Discord hat keinen Code zurückgegeben. Bitte versuche es erneut.";
            case "oauth_state":
                return "Sicherheitsüberprüfung fehlgeschlagen. Bitte erneut anmelden.";
            case "oauth_access_denied":
                return "Du hast den Zugriff abgelehnt. Bitte erlaube den Zugriff, um fortzufahren.";
            case "oauth_interaction_required":
                return "Interaktion erforderlich. Bitte stimme im Discord-Fenster zu.";
            case "oauth_not_configured":
                return "Discord OAuth ist derzeit nicht konfiguriert.";
            case "oauth_token":
                return "Token-Austausch fehlgeschlagen. Bitte später erneut versuchen.";
            case "oauth_user":
                return "Benutzerinformationen konnten nicht geladen werden.";
            case "login_failed":
                return "Login fehlgeschlagen. Bitte später erneut versuchen.";
            default:
                return "Anmeldung fehlgeschlagen. Bitte erneut versuchen.";
        }
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[150px]"/>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/6 rounded-full blur-[120px]"/>
                {/* dunkles Overlay statt Aufheller */}
                <div className="absolute inset-0 bg-black/35"/>
                <div className="absolute inset-0 opacity-[0.05] bg-grid-soft"/>
            </div>

            <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-card border border-border card-glow">
                <div className="text-center">
                    <RLink to="/" className="inline-flex items-center gap-2 mb-8">
                        <div
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
                            <Link2 className="w-6 h-6 text-primary-foreground"/>
                        </div>
                        <span className="font-display text-2xl text-foreground">
              dcs<span className="text-primary">.</span>lol
            </span>
                    </RLink>

                    <div
                        className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-primary"/>
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">Anmelden</h1>
                    <p className="text-foreground/50 mb-6">
                        Melde dich mit Discord an, um deine Links zu verwalten.
                    </p>

                    {errorText && (
                        <div
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-left">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>
                            <div className="flex-1">
                                <p className="text-sm text-red-300">{errorText}</p>
                            </div>
                            <button onClick={() => setError("")} className="text-xs text-red-400 hover:text-red-300">
                                ×
                            </button>
                        </div>
                    )}

                    <button
                        onClick={login}
                        className="w-full py-3 px-6 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#5865F2]/20"
                    >
                        <LogIn className="w-5 h-5"/>
                        Mit Discord anmelden
                    </button>

                    <p className="text-xs text-foreground/40 mt-6">
                        Mit der Anmeldung erklärst du dich mit unseren Nutzungsbedingungen einverstanden.
                    </p>

                    <div className="mt-6 pt-6 border-t border-border space-y-3">
                        <p className="text-sm text-foreground/50">
                            Noch kein Account?{" "}
                            <RLink to="/register" className="text-primary hover:underline">
                                Jetzt registrieren
                            </RLink>
                        </p>
                        <RLink to="/"
                               className="text-sm text-foreground/40 hover:text-foreground transition-colors block">
                            ← Zurück zur Startseite
                        </RLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
