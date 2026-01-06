import React, {useMemo, useState} from "react";
import {Link2, Menu, X} from "lucide-react";
import {useAuth} from "../contexts/AuthContext";
import {Link as RLink} from "react-router-dom";

export const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const {user, logout} = useAuth();

    const avatarUrl = useMemo(() => {
        const fallback = "https://cdn.discordapp.com/embed/avatars/0.png";
        if (!user) return fallback;

        const raw = (user.avatar || "").trim();
        if (!raw) return fallback;

        if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

        const id = user.id;
        if (!id) return fallback;

        const ext = raw.startsWith("a_") ? "gif" : "png";
        return `https://cdn.discordapp.com/avatars/${id}/${raw}.${ext}?size=128`;
    }, [user]);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({behavior: "smooth"});
        setMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-6xl px-6 py-4">
                <nav className="glass-elevated rounded-2xl px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <RLink to="/" className="flex items-center gap-3 group">
                        <div
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform group-hover:scale-105 glow-sm">
                            <Link2 className="w-5 h-5 text-primary-foreground"/>
                        </div>
                        <span className="font-display text-2xl tracking-tight text-foreground">
              dcs<span className="text-primary">.</span>lol
            </span>
                    </RLink>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => scrollTo("features")}
                            className="text-foreground/60 hover:text-foreground transition-colors text-sm font-medium"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollTo("faq")}
                            className="text-foreground/60 hover:text-foreground transition-colors text-sm font-medium"
                        >
                            FAQ
                        </button>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <RLink
                                    to="/edit"
                                    className="text-foreground/60 hover:text-foreground transition-colors text-sm font-medium"
                                >
                                    Meine Links
                                </RLink>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={avatarUrl}
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full ring-2 ring-primary/40 bg-card object-cover"
                                        referrerPolicy="no-referrer"
                                        crossOrigin="anonymous"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png";
                                        }}
                                    />
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 rounded-xl btn-secondary text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <RLink
                                    to="/login"
                                    className="px-4 py-2 rounded-xl text-foreground/60 hover:text-foreground transition-colors text-sm font-medium"
                                >
                                    Login
                                </RLink>
                                <RLink
                                    to="/register"
                                    className="px-5 py-2.5 rounded-xl btn-primary text-sm"
                                >
                                    Registrieren
                                </RLink>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 text-foreground"
                        aria-label="Menu"
                    >
                        {menuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden mt-2 glass-elevated rounded-2xl p-6 animate-fade-up">
                        <div className="flex flex-col gap-4">
                            <button onClick={() => scrollTo("features")}
                                    className="text-foreground font-medium py-2 text-left">
                                Features
                            </button>
                            <button onClick={() => scrollTo("faq")}
                                    className="text-foreground font-medium py-2 text-left">
                                FAQ
                            </button>
                            {user ? (
                                <>
                                    <RLink to="/edit" onClick={() => setMenuOpen(false)}
                                           className="text-foreground font-medium py-2">
                                        Meine Links
                                    </RLink>
                                    <button onClick={() => {
                                        logout();
                                        setMenuOpen(false);
                                    }} className="text-foreground/60 py-2 text-left">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <RLink to="/login" onClick={() => setMenuOpen(false)}
                                           className="text-foreground font-medium py-2">
                                        Login
                                    </RLink>
                                    <RLink
                                        to="/register"
                                        onClick={() => setMenuOpen(false)}
                                        className="mt-2 px-5 py-3 rounded-xl btn-primary text-center"
                                    >
                                        Registrieren
                                    </RLink>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
