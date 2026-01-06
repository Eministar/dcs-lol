import React from "react";
import {useAuth} from "../contexts/AuthContext";
import {Info, Link2, UserPlus} from "lucide-react";
import {Link as RLink} from "react-router-dom";

const Register: React.FC = () => {
    const {login} = useAuth();

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
                        <UserPlus className="w-8 h-8 text-primary"/>
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">Registrieren</h1>
                    <p className="text-foreground/50 mb-6">
                        Erstelle einen Account mit Discord, um deine Kurzlinks später bearbeiten zu können.
                    </p>

                    <div
                        className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-left">
                        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
                        <p className="text-sm text-amber-200/90">
                            <strong className="text-amber-100">Wichtig:</strong> Links, die du ohne Account erstellst,
                            können später nicht deinem Konto zugeordnet werden.
                        </p>
                    </div>

                    <button
                        onClick={login}
                        className="w-full py-3 px-6 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#5865F2]/20"
                    >
                        <UserPlus className="w-5 h-5"/>
                        Mit Discord registrieren
                    </button>

                    <div className="mt-6 pt-6 border-t border-border space-y-3">
                        <p className="text-sm text-foreground/50">
                            Bereits einen Account?{" "}
                            <RLink to="/login" className="text-primary hover:underline">
                                Jetzt anmelden
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

export default Register;
