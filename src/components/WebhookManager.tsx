import React, {useEffect, useState} from "react";
import {Activity, Bell, CheckCircle, Globe, Plus, TestTube, Trash2, Webhook, X, Zap} from "lucide-react";

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
    {id: "link_created", name: "Link erstellt", description: "Wenn ein neuer Link verkürzt wird"},
    {id: "link_clicked", name: "Link geklickt", description: "Bei jedem Klick auf einen Link"},
    {id: "link_milestone", name: "Klick-Meilenstein", description: "Bei 100, 500, 1000+ Klicks"},
    {id: "server_featured", name: "Server featured", description: "Wenn ein Server im Showcase featured wird"},
    {id: "daily_stats", name: "Tägliche Stats", description: "Tägliche Zusammenfassung"},
];

const webhookFormats = [
    {id: "discord", name: "Discord", icon: "💬", description: "Discord Webhook Format"},
    {id: "slack", name: "Slack", icon: "📱", description: "Slack Webhook Format"},
    {id: "custom", name: "Custom JSON", icon: "⚙️", description: "Benutzerdefiniertes Format"},
];

export const WebhookManager: React.FC<WebhookManagerProps> = ({isOpen, onClose}) => {
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
    const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
        name: "",
        url: "",
        events: [],
        active: true,
        format: "discord",
    });

    useEffect(() => {
        fetch("/api/webhooks")
            .then((res) => res.json())
            .then(setWebhooks)
            .catch((err) => console.error("Fehler beim Laden der Webhooks:", err));
    }, []);

    const handleAddWebhook = () => {
        if (!newWebhook.name || !newWebhook.url || !newWebhook.events?.length) return;
        const webhook: WebhookConfig = {
            id: Date.now().toString(),
            name: newWebhook.name,
            url: newWebhook.url,
            events: newWebhook.events,
            active: newWebhook.active || true,
            totalCalls: 0,
            format: newWebhook.format || "discord",
        };
        setWebhooks((prev) => [...prev, webhook]);
        setNewWebhook({name: "", url: "", events: [], active: true, format: "discord"});
        setShowAddForm(false);
    };

    const handleDeleteWebhook = (id: string) => {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
    };

    const handleToggleWebhook = (id: string) => {
        setWebhooks((prev) => prev.map((w) => (w.id === id ? {...w, active: !w.active} : w)));
    };

    const handleTestWebhook = async (id: string) => {
        setTestingWebhook(id);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setTestingWebhook(null);
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
                            <p className="text-muted-foreground text-sm">Automatische Benachrichtigungen</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4"/>
                            Hinzufügen
                        </button>
                        <button onClick={onClose}
                                className="p-3 rounded-xl bg-secondary hover:bg-muted transition-colors">
                            <X className="w-5 h-5 text-foreground"/>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="p-5 rounded-2xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-primary"/>
                                </div>
                                <span className="text-xs font-medium text-primary">AKTIV</span>
                            </div>
                            <div
                                className="text-2xl font-bold text-foreground">{webhooks.filter((w) => w.active).length}</div>
                            <div className="text-sm text-muted-foreground">Aktive Webhooks</div>
                        </div>
                        <div className="p-5 rounded-2xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-primary"/>
                                </div>
                                <span className="text-xs font-medium text-primary">HEUTE</span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">47</div>
                            <div className="text-sm text-muted-foreground">Benachrichtigungen</div>
                        </div>
                        <div className="p-5 rounded-2xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-primary"/>
                                </div>
                                <span className="text-xs font-medium text-primary">GESAMT</span>
                            </div>
                            <div
                                className="text-2xl font-bold text-foreground">{webhooks.reduce((sum, w) => sum + w.totalCalls, 0)}</div>
                            <div className="text-sm text-muted-foreground">Webhook Calls</div>
                        </div>
                    </div>

                    {/* Webhooks List */}
                    <div className="space-y-4">
                        {webhooks.map((webhook) => (
                            <div key={webhook.id} className="p-5 rounded-2xl bg-card border border-border">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${webhook.active ? "bg-primary" : "bg-muted"}`}>
                                            <Webhook className="w-5 h-5 text-primary-foreground"/>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{webhook.name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3"/>
                            {webhookFormats.find((f) => f.id === webhook.format)?.name}
                        </span>
                                                <span>{webhook.events.length} Events</span>
                                                <span>{webhook.totalCalls} Calls</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTestWebhook(webhook.id)}
                                            disabled={testingWebhook === webhook.id}
                                            className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors disabled:opacity-50"
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
                                            {webhook.active ? "Aktiv" : "Inaktiv"}
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
                                    className="block bg-background p-3 rounded-lg text-sm text-muted-foreground truncate">{webhook.url}</code>
                            </div>
                        ))}
                    </div>

                    {webhooks.length === 0 && (
                        <div className="text-center py-12">
                            <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                            <p className="text-muted-foreground">Noch keine Webhooks konfiguriert</p>
                        </div>
                    )}
                </div>

                {/* Add Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-md"
                             onClick={() => setShowAddForm(false)}/>
                        <div className="relative bg-card rounded-2xl p-6 max-w-lg w-full border border-border">
                            <h3 className="text-xl font-bold text-foreground mb-6">Neuen Webhook hinzufügen</h3>
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
                                                    <span
                                                        className="font-medium text-foreground text-sm">{event.name}</span>
                                                    {(newWebhook.events || []).includes(event.id) &&
                                                        <CheckCircle className="w-4 h-4 text-primary"/>}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{event.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleAddWebhook}
                                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Erstellen
                                    </button>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-muted transition-colors"
                                    >
                                        Abbrechen
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
