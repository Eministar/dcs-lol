import React, {useEffect, useState} from "react";
import {
    Activity,
    AlertCircle,
    Bell,
    CheckCircle,
    Globe,
    Plus,
    RefreshCw,
    TestTube,
    Trash2,
    Webhook,
    X,
    Zap
} from "lucide-react";
import {useLanguage} from "../contexts/LanguageContext";

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

interface WebhookManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const availableEvents = [
    {
        id: "link_created",
        name: "Link erstellt",
        nameEn: "Link Created",
        description: "Wenn ein neuer Link verkürzt wird",
        descriptionEn: "When a new link is shortened"
    },
    {
        id: "link_clicked",
        name: "Link geklickt",
        nameEn: "Link Clicked",
        description: "Bei jedem Klick auf einen Link",
        descriptionEn: "On every link click"
    },
    {
        id: "link_milestone",
        name: "Klick-Meilenstein",
        nameEn: "Click Milestone",
        description: "Bei 100, 500, 1000+ Klicks",
        descriptionEn: "At 100, 500, 1000+ clicks"
    },
    {
        id: "server_featured",
        name: "Server featured",
        nameEn: "Server Featured",
        description: "Wenn ein Server im Showcase featured wird",
        descriptionEn: "When a server is featured"
    },
    {
        id: "daily_stats",
        name: "Tägliche Stats",
        nameEn: "Daily Stats",
        description: "Tägliche Zusammenfassung",
        descriptionEn: "Daily summary"
    },
];

const webhookFormats = [
    {id: "discord", name: "Discord", icon: "💬", description: "Discord Webhook Format"},
    {id: "slack", name: "Slack", icon: "📱", description: "Slack Webhook Format"},
    {id: "custom", name: "Custom JSON", icon: "⚙️", description: "Custom JSON Format"},
];

export const WebhookManager: React.FC<WebhookManagerProps> = ({isOpen, onClose}) => {
    const {language} = useLanguage();
    const isDE = language === "de";

    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
        name: "",
        url: "",
        events: [],
        active: true,
        format: "discord",
    });

    // Load webhooks from API
    const loadWebhooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/webhooks");
            if (!res.ok) throw new Error("Failed to load webhooks");
            const data = await res.json();
            setWebhooks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fehler beim Laden der Webhooks:", err);
            setError(isDE ? "Fehler beim Laden der Webhooks" : "Failed to load webhooks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadWebhooks();
        }
    }, [isOpen]);

    // Create new webhook via API
    const handleAddWebhook = async () => {
        if (!newWebhook.name || !newWebhook.url || !newWebhook.events?.length) return;

        setSaving(true);
        try {
            const res = await fetch("/api/webhooks", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: newWebhook.name,
                    url: newWebhook.url,
                    events: newWebhook.events,
                    active: newWebhook.active !== false,
                    format: newWebhook.format || "discord",
                }),
            });

            if (!res.ok) throw new Error("Failed to create webhook");

            const created = await res.json();
            setWebhooks((prev) => [...prev, created]);
            setNewWebhook({name: "", url: "", events: [], active: true, format: "discord"});
            setShowAddForm(false);
        } catch (err) {
            console.error("Fehler beim Erstellen des Webhooks:", err);
            setError(isDE ? "Fehler beim Erstellen" : "Failed to create webhook");
        } finally {
            setSaving(false);
        }
    };

    // Delete webhook via API
    const handleDeleteWebhook = async (id: string) => {
        try {
            const res = await fetch(`/api/webhooks/${id}`, {method: "DELETE"});
            if (!res.ok) throw new Error("Failed to delete webhook");
            setWebhooks((prev) => prev.filter((w) => w.id !== id));
        } catch (err) {
            console.error("Fehler beim Löschen des Webhooks:", err);
            setError(isDE ? "Fehler beim Löschen" : "Failed to delete webhook");
        }
    };

    // Toggle webhook active state via API
    const handleToggleWebhook = async (id: string) => {
        const webhook = webhooks.find((w) => w.id === id);
        if (!webhook) return;

        try {
            const res = await fetch(`/api/webhooks/${id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({...webhook, active: !webhook.active}),
            });
            if (!res.ok) throw new Error("Failed to update webhook");
            setWebhooks((prev) => prev.map((w) => (w.id === id ? {...w, active: !w.active} : w)));
        } catch (err) {
            console.error("Fehler beim Aktualisieren des Webhooks:", err);
        }
    };

    // Test webhook via API
    const handleTestWebhook = async (id: string) => {
        setTestingWebhook(id);
        setTestResult(null);

        try {
            const res = await fetch(`/api/webhooks/${id}/test`, {method: "POST"});
            const data = await res.json();

            if (res.ok && data.success) {
                setTestResult({id, success: true, message: isDE ? "Erfolgreich gesendet!" : "Successfully sent!"});
                // Refresh webhooks to get updated totalCalls
                loadWebhooks();
            } else {
                setTestResult({
                    id,
                    success: false,
                    message: data.error || (isDE ? "Test fehlgeschlagen" : "Test failed")
                });
            }
        } catch {
            setTestResult({id, success: false, message: isDE ? "Netzwerkfehler" : "Network error"});
        } finally {
            setTestingWebhook(null);
            // Clear result after 3 seconds
            setTimeout(() => setTestResult(null), 3000);
        }
    };

    const toggleEvent = (eventId: string) => {
        const currentEvents = newWebhook.events || [];
        const updatedEvents = currentEvents.includes(eventId)
            ? currentEvents.filter((e) => e !== eventId)
            : [...currentEvents, eventId];
        setNewWebhook((prev) => ({...prev, events: updatedEvents}));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose}/>

            <div
                className="relative w-full max-w-5xl max-h-[90vh] bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Webhook className="w-6 h-6 text-primary"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Webhook Manager</h2>
                            <p className="text-muted-foreground text-sm">
                                {isDE ? "Automatische Benachrichtigungen" : "Automatic Notifications"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadWebhooks}
                            disabled={loading}
                            className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors disabled:opacity-50"
                            title={isDE ? "Aktualisieren" : "Refresh"}
                        >
                            <RefreshCw className={`w-5 h-5 text-foreground ${loading ? "animate-spin" : ""}`}/>
                        </button>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4"/>
                            {isDE ? "Hinzufügen" : "Add"}
                        </button>
                        <button onClick={onClose}
                                className="p-3 rounded-xl bg-secondary hover:bg-muted transition-colors">
                            <X className="w-5 h-5 text-foreground"/>
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div
                        className="mx-6 mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive"/>
                        <span className="text-destructive text-sm">{error}</span>
                        <button onClick={() => setError(null)}
                                className="ml-auto text-destructive hover:text-destructive/80">
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="p-5 rounded-2xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-primary"/>
                                </div>
                                <span className="text-xs font-medium text-primary">{isDE ? "AKTIV" : "ACTIVE"}</span>
                            </div>
                            <div
                                className="text-2xl font-bold text-foreground">{webhooks.filter((w) => w.active).length}</div>
                            <div
                                className="text-sm text-muted-foreground">{isDE ? "Aktive Webhooks" : "Active Webhooks"}</div>
                        </div>
                        <div className="p-5 rounded-2xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-accent"/>
                                </div>
                                <span className="text-xs font-medium text-accent">{isDE ? "GESAMT" : "TOTAL"}</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">{webhooks.length}</div>
                            <div
                                className="text-sm text-muted-foreground">{isDE ? "Konfigurierte Webhooks" : "Configured Webhooks"}</div>
                        </div>
                        <div className="p-5 rounded-2xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-primary"/>
                                </div>
                                <span className="text-xs font-medium text-primary">{isDE ? "CALLS" : "CALLS"}</span>
                            </div>
                            <div
                                className="text-2xl font-bold text-foreground">{webhooks.reduce((sum, w) => sum + (w.totalCalls || 0), 0)}</div>
                            <div
                                className="text-sm text-muted-foreground">{isDE ? "Webhook Aufrufe" : "Webhook Calls"}</div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <RefreshCw className="w-8 h-8 text-primary mx-auto mb-4 animate-spin"/>
                            <p className="text-muted-foreground">{isDE ? "Lade Webhooks..." : "Loading webhooks..."}</p>
                        </div>
                    )}

                    {/* Webhooks List */}
                    {!loading && (
                        <div className="space-y-4">
                            {webhooks.map((webhook) => (
                                <div key={webhook.id} className={`p-5 rounded-2xl bg-card border transition-all ${
                                    testResult?.id === webhook.id
                                        ? testResult.success
                                            ? "border-emerald-500/50"
                                            : "border-red-500/50"
                                        : "border-border"
                                }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${webhook.active ? "bg-primary" : "bg-muted"}`}>
                                                <Webhook
                                                    className={`w-5 h-5 ${webhook.active ? "text-primary-foreground" : "text-muted-foreground"}`}/>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{webhook.name}</h3>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3 h-3"/>
                                                        {webhookFormats.find((f) => f.id === webhook.format)?.name || "Custom"}
                                                    </span>
                                                    <span>{(webhook.events || []).length} Events</span>
                                                    <span>{webhook.totalCalls || 0} Calls</span>
                                                    {webhook.lastTriggered && (
                                                        <span className="text-xs">
                                                            {isDE ? "Zuletzt: " : "Last: "}
                                                            {new Date(webhook.lastTriggered).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Test Result Indicator */}
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
                                                onClick={() => handleTestWebhook(webhook.id)}
                                                disabled={testingWebhook === webhook.id || !webhook.active}
                                                className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors disabled:opacity-50"
                                                title={isDE ? "Webhook testen" : "Test webhook"}
                                            >
                                                {testingWebhook === webhook.id ? (
                                                    <div
                                                        className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                                                ) : (
                                                    <TestTube className="w-4 h-4 text-muted-foreground"/>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleToggleWebhook(webhook.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                    webhook.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                }`}
                                            >
                                                {webhook.active ? (isDE ? "Aktiv" : "Active") : (isDE ? "Inaktiv" : "Inactive")}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteWebhook(webhook.id)}
                                                className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive"/>
                                            </button>
                                        </div>
                                    </div>
                                    <code
                                        className="block bg-background p-3 rounded-lg text-sm text-muted-foreground truncate">
                                        {webhook.url}
                                    </code>
                                    {/* Show events */}
                                    {webhook.events && webhook.events.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {webhook.events.map((eventId) => {
                                                const event = availableEvents.find((e) => e.id === eventId);
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

                    {!loading && webhooks.length === 0 && (
                        <div className="text-center py-12">
                            <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                            <p className="text-muted-foreground mb-4">
                                {isDE ? "Noch keine Webhooks konfiguriert" : "No webhooks configured yet"}
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                            >
                                {isDE ? "Ersten Webhook erstellen" : "Create first webhook"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-md"
                             onClick={() => setShowAddForm(false)}/>
                        <div
                            className="relative bg-card rounded-2xl p-6 max-w-lg w-full border border-border max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-foreground mb-6">
                                {isDE ? "Neuen Webhook hinzufügen" : "Add New Webhook"}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newWebhook.name || ""}
                                        onChange={(e) => setNewWebhook((prev) => ({...prev, name: e.target.value}))}
                                        placeholder="Discord Notifications"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Webhook
                                        URL</label>
                                    <input
                                        type="url"
                                        value={newWebhook.url || ""}
                                        onChange={(e) => setNewWebhook((prev) => ({...prev, url: e.target.value}))}
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Format</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {webhookFormats.map((format) => (
                                            <button
                                                key={format.id}
                                                onClick={() => setNewWebhook((prev) => ({
                                                    ...prev,
                                                    format: format.id as WebhookConfig["format"]
                                                }))}
                                                className={`p-3 rounded-xl border-2 transition-all ${
                                                    newWebhook.format === format.id ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
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
                                        {availableEvents.map((event) => (
                                            <button
                                                key={event.id}
                                                onClick={() => toggleEvent(event.id)}
                                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                                    (newWebhook.events || []).includes(event.id)
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-muted-foreground"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-foreground text-sm">
                                                        {isDE ? event.name : event.nameEn}
                                                    </span>
                                                    {(newWebhook.events || []).includes(event.id) &&
                                                        <CheckCircle className="w-4 h-4 text-primary"/>}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {isDE ? event.description : event.descriptionEn}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleAddWebhook}
                                        disabled={saving || !newWebhook.name || !newWebhook.url || !newWebhook.events?.length}
                                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving && <RefreshCw className="w-4 h-4 animate-spin"/>}
                                        {isDE ? "Erstellen" : "Create"}
                                    </button>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-muted transition-colors"
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
