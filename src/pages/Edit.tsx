import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../contexts/AuthContext";
import {
    AlertCircle,
    Bell,
    CheckCircle,
    Globe,
    ImageIcon,
    Link2,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Server,
    TestTube2,
    Trash2,
    Webhook,
    X
} from "lucide-react";
import {Link as RLink} from "react-router-dom";
import {useLanguage} from "../contexts/LanguageContext";

interface LinkItem {
    id: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
    createdAt: string;
}

interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: string[];
    active: boolean;
    lastTriggered?: string;
    totalCalls: number;
    format: "discord" | "slack" | "custom";
}

interface ShowcaseEntry {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    inviteLink: string;
    category: string;
    tags: string[];
    createdAt: string;
    featured: boolean;
    verified: boolean;
}

const categories = [
    'Gaming', 'Tech', 'Art', 'Music', 'Education', 'Community', 'Business', 'Other'
];

const availableEvents = [
    {id: "link_created", name: "Link erstellt", nameEn: "Link Created"},
    {id: "link_clicked", name: "Link geklickt", nameEn: "Link Clicked"},
    {id: "link_milestone", name: "Klick-Meilenstein", nameEn: "Click Milestone"},
];

const webhookFormats = [
    {id: "discord", name: "Discord", icon: "💬"},
    {id: "slack", name: "Slack", icon: "📱"},
    {id: "custom", name: "Custom", icon: "⚙️"},
];

const Edit: React.FC = () => {
    const {language} = useLanguage();
    const isDE = language === "de";
    const {user, loading, login, logout, refresh} = useAuth();
    const [activeTab, setActiveTab] = useState<"links" | "webhooks" | "showcase">("links");

    // Links State
    const [items, setItems] = useState<LinkItem[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [formUrl, setFormUrl] = useState("");
    const [formSlug, setFormSlug] = useState("");

    // Webhooks State
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [webhooksLoading, setWebhooksLoading] = useState(false);
    const [showAddWebhook, setShowAddWebhook] = useState(false);
    const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
    const [newWebhook, setNewWebhook] = useState({
        name: "",
        url: "",
        events: [] as string[],
        format: "discord" as "discord" | "slack" | "custom",
        active: true
    });

    // Showcase State
    const [showcaseEntries, setShowcaseEntries] = useState<ShowcaseEntry[]>([]);
    const [showcaseLoading, setShowcaseLoading] = useState(false);
    const [editingShowcase, setEditingShowcase] = useState<ShowcaseEntry | null>(null);
    const [showcaseFormData, setShowcaseFormData] = useState({
        name: "",
        description: "",
        inviteLink: "",
        category: "",
        tags: [] as string[],
        newTag: ""
    });
    const [showcaseLogo, setShowcaseLogo] = useState<File | null>(null);

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

    // Webhook Functions
    const fetchWebhooks = async () => {
        setWebhooksLoading(true);
        try {
            const res = await fetch("/api/webhooks");
            if (!res.ok) throw new Error("Fehler beim Laden");
            const data = await res.json();
            setWebhooks(Array.isArray(data) ? data : []);
        } catch {
            setWebhooks([]);
        } finally {
            setWebhooksLoading(false);
        }
    };

    const createWebhook = async () => {
        if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) return;
        setBusy(true);
        try {
            const res = await fetch("/api/webhooks", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newWebhook)
            });
            if (!res.ok) throw new Error("Fehler beim Erstellen");
            const created = await res.json();
            setWebhooks(prev => [...prev, created]);
            setNewWebhook({name: "", url: "", events: [], format: "discord", active: true});
            setShowAddWebhook(false);
        } catch (e) {
            if (e instanceof Error) setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const updateWebhook = async (id: string, updates: Partial<WebhookConfig>) => {
        try {
            const webhook = webhooks.find(w => w.id === id);
            if (!webhook) return;
            const res = await fetch(`/api/webhooks/${id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({...webhook, ...updates})
            });
            if (!res.ok) throw new Error("Fehler beim Aktualisieren");
            setWebhooks(prev => prev.map(w => w.id === id ? {...w, ...updates} : w));
        } catch (e) {
            if (e instanceof Error) setError(e.message);
        }
    };

    const deleteWebhook = async (id: string) => {
        if (!confirm(isDE ? "Webhook wirklich löschen?" : "Really delete this webhook?")) return;
        try {
            const res = await fetch(`/api/webhooks/${id}`, {method: "DELETE"});
            if (!res.ok) throw new Error("Fehler beim Löschen");
            setWebhooks(prev => prev.filter(w => w.id !== id));
        } catch (e) {
            if (e instanceof Error) setError(e.message);
        }
    };

    const testWebhook = async (id: string) => {
        setTestingWebhook(id);
        setTestResult(null);
        try {
            const res = await fetch(`/api/webhooks/${id}/test`, {method: "POST"});
            const data = await res.json();
            if (res.ok && data.success) {
                setTestResult({id, success: true, message: isDE ? "Erfolgreich!" : "Success!"});
                fetchWebhooks();
            } else {
                setTestResult({id, success: false, message: data.error || (isDE ? "Fehlgeschlagen" : "Failed")});
            }
        } catch {
            setTestResult({id, success: false, message: isDE ? "Netzwerkfehler" : "Network error"});
        } finally {
            setTestingWebhook(null);
            setTimeout(() => setTestResult(null), 3000);
        }
    };

    const toggleWebhookEvent = (eventId: string) => {
        setNewWebhook(prev => ({
            ...prev,
            events: prev.events.includes(eventId)
                ? prev.events.filter(e => e !== eventId)
                : [...prev.events, eventId]
        }));
    };

    // Showcase Functions
    const fetchShowcase = async () => {
        setShowcaseLoading(true);
        try {
            const res = await fetch("/api/showcase/my", {credentials: "include"});
            if (!res.ok) {
                setShowcaseEntries([]);
                return;
            }
            const data = await res.json();
            setShowcaseEntries(Array.isArray(data) ? data : []);
        } catch {
            setShowcaseEntries([]);
        } finally {
            setShowcaseLoading(false);
        }
    };

    const startEditShowcase = (entry: ShowcaseEntry) => {
        setEditingShowcase(entry);
        setShowcaseFormData({
            name: entry.name,
            description: entry.description,
            inviteLink: entry.inviteLink,
            category: entry.category,
            tags: entry.tags || [],
            newTag: ""
        });
        setShowcaseLogo(null);
    };

    const cancelEditShowcase = () => {
        setEditingShowcase(null);
        setShowcaseFormData({
            name: "",
            description: "",
            inviteLink: "",
            category: "",
            tags: [],
            newTag: ""
        });
        setShowcaseLogo(null);
    };

    const saveShowcase = async () => {
        if (!editingShowcase) return;
        setBusy(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("name", showcaseFormData.name);
            formData.append("description", showcaseFormData.description);
            formData.append("inviteLink", showcaseFormData.inviteLink);
            formData.append("category", showcaseFormData.category);
            formData.append("tags", JSON.stringify(showcaseFormData.tags));
            if (showcaseLogo) {
                formData.append("logo", showcaseLogo);
            }

            const res = await fetch(`/api/showcase/${editingShowcase.id}`, {
                method: "PUT",
                credentials: "include",
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(typeof data.error === "string" ? data.error : "Fehler beim Speichern");
            }

            await fetchShowcase();
            cancelEditShowcase();
        } catch (e) {
            if (e instanceof Error) setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const deleteShowcase = async (id: string) => {
        if (!confirm(isDE ? "Diesen Server wirklich löschen?" : "Really delete this server?")) return;
        setBusy(true);
        setError("");

        try {
            const res = await fetch(`/api/showcase/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Fehler beim Löschen");
            }

            setShowcaseEntries(prev => prev.filter(e => e.id !== id));
        } catch (e) {
            if (e instanceof Error) setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const addShowcaseTag = () => {
        const tag = showcaseFormData.newTag.trim();
        if (tag && !showcaseFormData.tags.includes(tag) && showcaseFormData.tags.length < 5) {
            setShowcaseFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag],
                newTag: ""
            }));
        }
    };

    const removeShowcaseTag = (tag: string) => {
        setShowcaseFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
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

    useEffect(() => {
        if (user && activeTab === "webhooks") {
            fetchWebhooks();
        }
    }, [user, activeTab]);

    useEffect(() => {
        if (user && activeTab === "showcase") {
            fetchShowcase();
        }
    }, [user, activeTab]);

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

    const getAvatarUrl = () => {
        // Backend liefert bereits die volle CDN-URL
        const fallback = "https://cdn.discordapp.com/embed/avatars/0.png";
        if (!user) return fallback;

        const raw = (user.avatar || "").trim();
        if (!raw) return fallback;

        return raw;
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
        <div className="min-h-screen" style={{backgroundColor: '#0b1120'}}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-black/60"/>
                <div className="absolute inset-0 opacity-[0.06] bg-grid"/>
                <div className="absolute inset-0 noise"/>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[150px]"/>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/6 rounded-full blur-[120px]"/>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="glass-elevated rounded-2xl px-6 py-4 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <RLink to="/" className="flex items-center gap-2 group">
                            <div
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm transition-transform group-hover:scale-105">
                                <Link2 className="w-5 h-5 text-primary-foreground"/>
                            </div>
                            <span className="font-display text-xl text-foreground tracking-tight">
                dcs<span className="text-primary">.</span>lol
              </span>
                        </RLink>
                        <span className="text-foreground/30">/</span>
                        <h1 className="text-xl font-semibold text-foreground">Meine Links</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <img
                            src={getAvatarUrl()}
                            alt={user.username}
                            className="w-8 h-8 rounded-full ring-2 ring-primary/40 bg-card object-cover"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                const fallback = "https://cdn.discordapp.com/embed/avatars/0.png";
                                if (img.src !== fallback) {
                                    img.src = fallback;
                                }
                            }}
                        />
                        <span className="text-sm text-foreground/60">{user.username}</span>
                        <button onClick={logout} className="px-4 py-2 rounded-xl btn-secondary text-sm">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("links")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                            activeTab === "links"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border text-foreground/60 hover:text-foreground"
                        }`}
                    >
                        <Link2 className="w-4 h-4"/>
                        {isDE ? "Meine Links" : "My Links"}
                    </button>
                    <button
                        onClick={() => setActiveTab("webhooks")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                            activeTab === "webhooks"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border text-foreground/60 hover:text-foreground"
                        }`}
                    >
                        <Webhook className="w-4 h-4"/>
                        Webhooks
                    </button>
                    <button
                        onClick={() => setActiveTab("showcase")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                            activeTab === "showcase"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border text-foreground/60 hover:text-foreground"
                        }`}
                    >
                        <Server className="w-4 h-4"/>
                        {isDE ? "Meine Server" : "My Servers"}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>
                        <p className="text-sm text-red-300">{error}</p>
                        <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                )}

                {/* Links Tab */}
                {activeTab === "links" && (
                    <>
                        {/* Links Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((link) => (
                                <div key={link.id} className="p-6 rounded-2xl bg-card border border-border card-glow">
                                    <div className="text-xs text-foreground/40 mb-2">
                                        {isDE ? "Erstellt am" : "Created"} {new Date(link.createdAt).toLocaleString()}
                                    </div>
                                    <div className="text-lg font-mono text-primary mb-1">dcs.lol/{link.id}</div>
                                    <div className="text-sm text-foreground/50 truncate mb-3">{link.originalUrl}</div>
                                    <div className="text-sm text-foreground/50">
                                        {isDE ? "Klicks:" : "Clicks:"} <span
                                        className="font-semibold text-foreground">{link.clicks}</span>
                                    </div>

                                    {editId === link.id ? (
                                        <div className="mt-4 space-y-3">
                                            <input
                                                value={formUrl}
                                                onChange={(e) => setFormUrl(e.target.value)}
                                                className="w-full px-4 py-2 bg-card border border-border rounded-xl text-foreground text-sm input-glow focus:outline-none transition-all"
                                                placeholder={isDE ? "Neuer Discord-Link" : "New Discord link"}
                                            />
                                            <input
                                                value={formSlug}
                                                onChange={(e) => setFormSlug(e.target.value)}
                                                className="w-full px-4 py-2 bg-card border border-border rounded-xl text-foreground text-sm input-glow focus:outline-none transition-all"
                                                placeholder={isDE ? `Neue ID (optional, z.B. ${link.id})` : `New ID (optional, e.g. ${link.id})`}
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={saveEdit}
                                                    disabled={busy}
                                                    className="flex-1 py-2 rounded-xl btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <Save className="w-4 h-4"/>
                                                    {isDE ? "Speichern" : "Save"}
                                                </button>
                                                <button onClick={cancelEdit}
                                                        className="flex-1 py-2 rounded-xl btn-secondary">
                                                    {isDE ? "Abbrechen" : "Cancel"}
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
                                                {isDE ? "Bearbeiten" : "Edit"}
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
                                <p className="text-foreground/50 mb-4">{isDE ? "Du hast noch keine Links erstellt." : "You haven't created any links yet."}</p>
                                <RLink to="/" className="text-primary hover:underline">
                                    {isDE ? "Jetzt Link erstellen" : "Create a link now"}
                                </RLink>
                            </div>
                        )}
                    </>
                )}

                {/* Webhooks Tab */}
                {activeTab === "webhooks" && (
                    <>
                        {/* Webhooks Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">{isDE ? "Deine Webhooks" : "Your Webhooks"}</h2>
                                <p className="text-sm text-foreground/50">{isDE ? "Erhalte Benachrichtigungen bei Link-Events" : "Get notifications for link events"}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={fetchWebhooks}
                                    disabled={webhooksLoading}
                                    className="p-2 rounded-xl btn-secondary"
                                    title={isDE ? "Aktualisieren" : "Refresh"}
                                >
                                    <RefreshCw className={`w-5 h-5 ${webhooksLoading ? "animate-spin" : ""}`}/>
                                </button>
                                <button
                                    onClick={() => setShowAddWebhook(true)}
                                    className="px-4 py-2 rounded-xl btn-primary flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4"/>
                                    {isDE ? "Hinzufügen" : "Add"}
                                </button>
                            </div>
                        </div>

                        {/* Webhooks Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-card border border-border">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Webhook className="w-5 h-5 text-primary"/>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground">{webhooks.length}</div>
                                        <div
                                            className="text-xs text-foreground/50">{isDE ? "Webhooks" : "Webhooks"}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-card border border-border">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-400"/>
                                    </div>
                                    <div>
                                        <div
                                            className="text-2xl font-bold text-foreground">{webhooks.filter(w => w.active).length}</div>
                                        <div className="text-xs text-foreground/50">{isDE ? "Aktiv" : "Active"}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-card border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-accent"/>
                                    </div>
                                    <div>
                                        <div
                                            className="text-2xl font-bold text-foreground">{webhooks.reduce((sum, w) => sum + (w.totalCalls || 0), 0)}</div>
                                        <div className="text-xs text-foreground/50">{isDE ? "Aufrufe" : "Calls"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Webhooks Loading */}
                        {webhooksLoading && (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin"/>
                            </div>
                        )}

                        {/* Webhooks List */}
                        {!webhooksLoading && (
                            <div className="space-y-4">
                                {webhooks.map((webhook) => (
                                    <div
                                        key={webhook.id}
                                        className={`p-5 rounded-2xl bg-card border transition-all ${
                                            testResult?.id === webhook.id
                                                ? testResult.success ? "border-emerald-500/50" : "border-red-500/50"
                                                : "border-border"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        webhook.active ? "bg-primary" : "bg-muted"
                                                    }`}>
                                                    <Webhook
                                                        className={`w-5 h-5 ${webhook.active ? "text-primary-foreground" : "text-muted-foreground"}`}/>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{webhook.name}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-foreground/50">
                                                        <Globe className="w-3 h-3"/>
                                                        {webhookFormats.find(f => f.id === webhook.format)?.name || "Custom"}
                                                        <span>•</span>
                                                        <span>{(webhook.events || []).length} Events</span>
                                                        <span>•</span>
                                                        <span>{webhook.totalCalls || 0} Calls</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {testResult?.id === webhook.id && (
                                                    <span className={`text-xs px-2 py-1 rounded-lg ${
                                                        testResult.success
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                        {testResult.message}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => testWebhook(webhook.id)}
                                                    disabled={testingWebhook === webhook.id || !webhook.active}
                                                    className="p-2 rounded-lg btn-secondary disabled:opacity-50"
                                                    title={isDE ? "Testen" : "Test"}
                                                >
                                                    {testingWebhook === webhook.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                                    ) : (
                                                        <TestTube2 className="w-4 h-4"/>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => updateWebhook(webhook.id, {active: !webhook.active})}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                        webhook.active
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    {webhook.active ? (isDE ? "Aktiv" : "Active") : (isDE ? "Inaktiv" : "Inactive")}
                                                </button>
                                                <button
                                                    onClick={() => deleteWebhook(webhook.id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>
                                        <code
                                            className="block bg-background p-3 rounded-lg text-xs text-foreground/60 truncate">
                                            {webhook.url}
                                        </code>
                                        {webhook.events && webhook.events.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {webhook.events.map(eventId => {
                                                    const event = availableEvents.find(e => e.id === eventId);
                                                    return (
                                                        <span key={eventId}
                                                              className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs">
                                                            {isDE ? event?.name : event?.nameEn || eventId}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!webhooksLoading && webhooks.length === 0 && (
                            <div className="text-center py-16">
                                <Webhook className="w-12 h-12 text-foreground/30 mx-auto mb-4"/>
                                <p className="text-foreground/50 mb-4">{isDE ? "Noch keine Webhooks konfiguriert" : "No webhooks configured yet"}</p>
                                <button
                                    onClick={() => setShowAddWebhook(true)}
                                    className="px-4 py-2 rounded-xl btn-primary"
                                >
                                    {isDE ? "Ersten Webhook erstellen" : "Create first webhook"}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Add Webhook Modal */}
                {showAddWebhook && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-md"
                             onClick={() => setShowAddWebhook(false)}/>
                        <div
                            className="relative bg-card rounded-2xl p-6 max-w-lg w-full border border-border max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-foreground">{isDE ? "Neuer Webhook" : "New Webhook"}</h3>
                                <button onClick={() => setShowAddWebhook(false)}
                                        className="p-2 rounded-lg btn-secondary">
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newWebhook.name}
                                        onChange={(e) => setNewWebhook(prev => ({...prev, name: e.target.value}))}
                                        placeholder="Discord Notifications"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Webhook
                                        URL</label>
                                    <input
                                        type="url"
                                        value={newWebhook.url}
                                        onChange={(e) => setNewWebhook(prev => ({...prev, url: e.target.value}))}
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Format</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {webhookFormats.map(format => (
                                            <button
                                                key={format.id}
                                                onClick={() => setNewWebhook(prev => ({
                                                    ...prev,
                                                    format: format.id as "discord" | "slack" | "custom"
                                                }))}
                                                className={`p-3 rounded-xl border-2 transition-all ${
                                                    newWebhook.format === format.id
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-foreground/30"
                                                }`}
                                            >
                                                <div className="text-xl mb-1">{format.icon}</div>
                                                <div className="text-xs text-foreground">{format.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Events</label>
                                    <div className="space-y-2">
                                        {availableEvents.map(event => (
                                            <button
                                                key={event.id}
                                                onClick={() => toggleWebhookEvent(event.id)}
                                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                                    newWebhook.events.includes(event.id)
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-foreground/30"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-foreground text-sm">
                                                        {isDE ? event.name : event.nameEn}
                                                    </span>
                                                    {newWebhook.events.includes(event.id) && (
                                                        <CheckCircle className="w-4 h-4 text-primary"/>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={createWebhook}
                                        disabled={busy || !newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
                                        className="flex-1 py-3 rounded-xl btn-primary font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {busy && <Loader2 className="w-4 h-4 animate-spin"/>}
                                        {isDE ? "Erstellen" : "Create"}
                                    </button>
                                    <button
                                        onClick={() => setShowAddWebhook(false)}
                                        className="flex-1 py-3 rounded-xl btn-secondary font-medium"
                                    >
                                        {isDE ? "Abbrechen" : "Cancel"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Showcase Tab */}
                {activeTab === "showcase" && (
                    <>
                        {/* Showcase Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">{isDE ? "Deine Server" : "Your Servers"}</h2>
                                <p className="text-sm text-foreground/50">{isDE ? "Verwalte deine Showcase-Einträge" : "Manage your showcase entries"}</p>
                            </div>
                            <button
                                onClick={fetchShowcase}
                                disabled={showcaseLoading}
                                className="p-2 rounded-xl btn-secondary"
                                title={isDE ? "Aktualisieren" : "Refresh"}
                            >
                                <RefreshCw className={`w-5 h-5 ${showcaseLoading ? "animate-spin" : ""}`}/>
                            </button>
                        </div>

                        {/* Showcase Loading */}
                        {showcaseLoading && (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin"/>
                            </div>
                        )}

                        {/* Showcase List */}
                        {!showcaseLoading && showcaseEntries.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {showcaseEntries.map((entry) => (
                                    <div key={entry.id}
                                         className="p-5 rounded-2xl bg-card border border-border card-glow">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={entry.logoUrl || "https://via.placeholder.com/64"}
                                                alt={entry.name}
                                                className="w-16 h-16 rounded-xl object-cover bg-background"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/64";
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-foreground truncate">{entry.name}</h3>
                                                    {entry.verified && (
                                                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0"/>
                                                    )}
                                                </div>
                                                <p className="text-sm text-foreground/50 line-clamp-2 mt-1">{entry.description}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span
                                                        className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs">
                                                        {entry.category}
                                                    </span>
                                                    <span className="text-xs text-foreground/40">
                                                        dcs.lol/{entry.inviteLink.replace("dcs.lol/", "")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {entry.tags.map((tag, i) => (
                                                    <span key={i}
                                                          className="px-2 py-0.5 rounded-lg bg-accent/10 text-accent text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => startEditShowcase(entry)}
                                                className="flex-1 py-2 rounded-xl btn-secondary flex items-center justify-center gap-2"
                                            >
                                                <Pencil className="w-4 h-4"/>
                                                {isDE ? "Bearbeiten" : "Edit"}
                                            </button>
                                            <button
                                                onClick={() => deleteShowcase(entry.id)}
                                                className="py-2 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!showcaseLoading && showcaseEntries.length === 0 && (
                            <div className="text-center py-16">
                                <Server className="w-12 h-12 text-foreground/30 mx-auto mb-4"/>
                                <p className="text-foreground/50 mb-4">
                                    {isDE ? "Du hast noch keine Server im Showcase." : "You don't have any servers in the showcase yet."}
                                </p>
                                <RLink to="/#showcase" className="text-primary hover:underline">
                                    {isDE ? "Server hinzufügen" : "Add a server"}
                                </RLink>
                            </div>
                        )}
                    </>
                )}

                {/* Edit Showcase Modal */}
                {editingShowcase && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={cancelEditShowcase}/>
                        <div
                            className="relative bg-card rounded-2xl p-6 max-w-lg w-full border border-border max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-foreground">
                                    {isDE ? "Server bearbeiten" : "Edit Server"}
                                </h3>
                                <button onClick={cancelEditShowcase} className="p-2 rounded-lg btn-secondary">
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Logo Preview */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={showcaseLogo ? URL.createObjectURL(showcaseLogo) : editingShowcase.logoUrl}
                                        alt="Logo"
                                        className="w-20 h-20 rounded-xl object-cover bg-background"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {isDE ? "Neues Logo" : "New Logo"}
                                        </label>
                                        <label
                                            className="px-4 py-2 rounded-xl btn-secondary cursor-pointer inline-flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4"/>
                                            {isDE ? "Auswählen" : "Choose"}
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setShowcaseLogo(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {isDE ? "Servername" : "Server Name"}
                                    </label>
                                    <input
                                        type="text"
                                        value={showcaseFormData.name}
                                        onChange={(e) => setShowcaseFormData(prev => ({...prev, name: e.target.value}))}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {isDE ? "Beschreibung" : "Description"}
                                    </label>
                                    <textarea
                                        value={showcaseFormData.description}
                                        onChange={(e) => setShowcaseFormData(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50 resize-none"
                                    />
                                </div>

                                {/* Invite Link */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {isDE ? "DCS Link" : "DCS Link"}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-foreground/50">dcs.lol/</span>
                                        <input
                                            type="text"
                                            value={showcaseFormData.inviteLink.replace("dcs.lol/", "")}
                                            onChange={(e) => setShowcaseFormData(prev => ({
                                                ...prev,
                                                inviteLink: `dcs.lol/${e.target.value}`
                                            }))}
                                            className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {isDE ? "Kategorie" : "Category"}
                                    </label>
                                    <select
                                        value={showcaseFormData.category}
                                        onChange={(e) => setShowcaseFormData(prev => ({
                                            ...prev,
                                            category: e.target.value
                                        }))}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="">{isDE ? "Auswählen..." : "Select..."}</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Tags ({showcaseFormData.tags.length}/5)
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {showcaseFormData.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-1"
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => removeShowcaseTag(tag)}
                                                    className="hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-3 h-3"/>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    {showcaseFormData.tags.length < 5 && (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={showcaseFormData.newTag}
                                                onChange={(e) => setShowcaseFormData(prev => ({
                                                    ...prev,
                                                    newTag: e.target.value
                                                }))}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addShowcaseTag();
                                                    }
                                                }}
                                                placeholder={isDE ? "Tag hinzufügen..." : "Add tag..."}
                                                className="flex-1 px-4 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50"
                                            />
                                            <button
                                                onClick={addShowcaseTag}
                                                className="px-4 py-2 rounded-xl btn-secondary"
                                            >
                                                <Plus className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={saveShowcase}
                                        disabled={busy || !showcaseFormData.name || !showcaseFormData.description}
                                        className="flex-1 py-3 rounded-xl btn-primary font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {busy && <Loader2 className="w-4 h-4 animate-spin"/>}
                                        <Save className="w-4 h-4"/>
                                        {isDE ? "Speichern" : "Save"}
                                    </button>
                                    <button
                                        onClick={cancelEditShowcase}
                                        className="flex-1 py-3 rounded-xl btn-secondary font-medium"
                                    >
                                        {isDE ? "Abbrechen" : "Cancel"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Edit;
