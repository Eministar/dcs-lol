import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../contexts/AuthContext";
import {AlertCircle, Link2, Loader2, Pencil, Save, Trash2} from "lucide-react";
import {Link as RLink} from "react-router-dom";

interface LinkItem {
    id: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
    createdAt: string;
}

const Edit: React.FC = () => {
    const {user, loading, login, logout, refresh} = useAuth();
    const [items, setItems] = useState<LinkItem[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [formUrl, setFormUrl] = useState("");
    const [formSlug, setFormSlug] = useState("");

    const fetchMine = async () => {
        try {
            const res = await fetch("/api/my/links", {credentials: "include", cache: "no-store"});
            if (!res.ok) throw new Error("Nicht eingeloggt");
            const data = await res.json();
            setItems(data.items || []);
        } catch (e: unknown) {
            setItems([]);
            if (e instanceof Error) {
                setError(e.message || "Fehler beim Laden");
            }
        }
    };

    const triedRefresh = useRef(false);
    useEffect(() => {
        if (!loading && !user && !triedRefresh.current) {
            triedRefresh.current = true;
            refresh().catch(() => {
            });
        }
    }, [loading, user, refresh]);

    useEffect(() => {
        if (user) fetchMine();
    }, [user]);

    const startEdit = (id: string) => {
        const it = items.find((i) => i.id === id);
        if (!it) return;
        setEditId(id);
        setFormUrl(it.originalUrl);
        setFormSlug("");
    };

    const cancelEdit = () => {
        setEditId(null);
        setFormUrl("");
        setFormSlug("");
    };

    const saveEdit = async () => {
        if (!editId) return;
        setBusy(true);
        setError("");
        try {
            const res = await fetch(`/api/my/links/${encodeURIComponent(editId)}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({originalUrl: formUrl, newCustomId: formSlug || undefined}),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Fehler beim Speichern");
            await fetchMine();
            cancelEdit();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message || "Fehler beim Speichern");
            }
        } finally {
            setBusy(false);
        }
    };

    const remove = async (id: string) => {
        if (!confirm("Diesen Link wirklich löschen?")) return;
        setBusy(true);
        setError("");
        try {
            const res = await fetch(`/api/my/links/${encodeURIComponent(id)}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Fehler beim Löschen");
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message || "Fehler beim Löschen");
            }
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary"/>
            </div>
        );
    }

    if (!user || !user.id) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[150px]"/>
                </div>
                <div
                    className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-card border border-border text-center card-glow">
                    <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4"/>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Anmeldung erforderlich</h1>
                    <p className="text-foreground/50 mb-6">Melde dich mit Discord an, um deine Links zu bearbeiten.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={login}
                                className="px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-all hover:shadow-lg hover:shadow-[#5865F2]/20">
                            Mit Discord anmelden
                        </button>
                        <RLink to="/" className="px-6 py-3 rounded-xl btn-secondary font-semibold">
                            Zurück
                        </RLink>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[150px]"/>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/6 rounded-full blur-[120px]"/>
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"/>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <RLink to="/" className="flex items-center gap-2">
                            <div
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
                                <Link2 className="w-5 h-5 text-primary-foreground"/>
                            </div>
                            <span className="font-display text-xl text-foreground">
                dcs<span className="text-primary">.</span>lol
              </span>
                        </RLink>
                        <span className="text-foreground/30">/</span>
                        <h1 className="text-xl font-semibold text-foreground">Meine Links</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                            alt={user.username}
                            className="w-8 h-8 rounded-full ring-2 ring-primary/40"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png";
                            }}
                        />
                        <span className="text-sm text-foreground/60">{user.username}</span>
                        <button onClick={logout} className="px-4 py-2 rounded-xl btn-secondary text-sm">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {/* Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((link) => (
                        <div key={link.id} className="p-6 rounded-2xl bg-card border border-border card-glow">
                            <div className="text-xs text-foreground/40 mb-2">
                                Erstellt am {new Date(link.createdAt).toLocaleString()}
                            </div>
                            <div className="text-lg font-mono text-primary mb-1">dcs.lol/{link.id}</div>
                            <div className="text-sm text-foreground/50 truncate mb-3">{link.originalUrl}</div>
                            <div className="text-sm text-foreground/50">
                                Klicks: <span className="font-semibold text-foreground">{link.clicks}</span>
                            </div>

                            {editId === link.id ? (
                                <div className="mt-4 space-y-3">
                                    <input
                                        value={formUrl}
                                        onChange={(e) => setFormUrl(e.target.value)}
                                        className="w-full px-4 py-2 bg-card border border-border rounded-xl text-foreground text-sm input-glow focus:outline-none transition-all"
                                        placeholder="Neuer Discord-Link"
                                    />
                                    <input
                                        value={formSlug}
                                        onChange={(e) => setFormSlug(e.target.value)}
                                        className="w-full px-4 py-2 bg-card border border-border rounded-xl text-foreground text-sm input-glow focus:outline-none transition-all"
                                        placeholder={`Neue ID (optional, z.B. ${link.id})`}
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={saveEdit}
                                            disabled={busy}
                                            className="flex-1 py-2 rounded-xl btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4"/>
                                            Speichern
                                        </button>
                                        <button onClick={cancelEdit} className="flex-1 py-2 rounded-xl btn-secondary">
                                            Abbrechen
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => startEdit(link.id)}
                                        className="flex-1 py-2 rounded-xl btn-secondary flex items-center justify-center gap-2"
                                    >
                                        <Pencil className="w-4 h-4"/>
                                        Bearbeiten
                                    </button>
                                    <button
                                        onClick={() => remove(link.id)}
                                        className="py-2 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {items.length === 0 && (
                    <div className="text-center py-16">
                        <Link2 className="w-12 h-12 text-foreground/30 mx-auto mb-4"/>
                        <p className="text-foreground/50 mb-4">Du hast noch keine Links erstellt.</p>
                        <RLink to="/" className="text-primary hover:underline">
                            Jetzt Link erstellen
                        </RLink>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Edit;
