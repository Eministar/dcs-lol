import React, { useState, useEffect } from "react";
import {
  Webhook,
  Plus,
  Trash2,
  Edit3,
  TestTube,
  CheckCircle,
  AlertCircle,
  Zap,
  Bell,
  Settings,
  Activity,
  Globe,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

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
    description: "Wenn ein neuer Link verkürzt wird",
  },
  {
    id: "link_clicked",
    name: "Link geklickt",
    description: "Bei jedem Klick auf einen Link",
  },
  {
    id: "link_milestone",
    name: "Klick-Meilenstein",
    description: "Bei 100, 500, 1000+ Klicks",
  },
  {
    id: "server_featured",
    name: "Server featured",
    description: "Wenn ein Server im Showcase featured wird",
  },
  {
    id: "daily_stats",
    name: "Tägliche Stats",
    description: "Tägliche Zusammenfassung",
  },
];

const webhookFormats = [
  {
    id: "discord",
    name: "Discord",
    icon: "💬",
    description: "Discord Webhook Format",
  },
  {
    id: "slack",
    name: "Slack",
    icon: "📱",
    description: "Slack Webhook Format",
  },
  {
    id: "custom",
    name: "Custom JSON",
    icon: "⚙️",
    description: "Benutzerdefiniertes Format",
  },
];

export const WebhookManager: React.FC<WebhookManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(
    null
  );
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
    if (!newWebhook.name || !newWebhook.url || !newWebhook.events?.length)
      return;

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
    setNewWebhook({
      name: "",
      url: "",
      events: [],
      active: true,
      format: "discord",
    });
    setShowAddForm(false);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const handleTestWebhook = async (id: string) => {
    setTestingWebhook(id);
    // Simulate webhook test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTestingWebhook(null);
  };

  const toggleEvent = (eventId: string) => {
    const currentEvents = editingWebhook?.events || newWebhook.events || [];
    const updatedEvents = currentEvents.includes(eventId)
      ? currentEvents.filter((e) => e !== eventId)
      : [...currentEvents, eventId];

    if (editingWebhook) {
      setEditingWebhook({ ...editingWebhook, events: updatedEvents });
    } else {
      setNewWebhook((prev) => ({ ...prev, events: updatedEvents }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Webhook className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">
                  Webhook Manager
                </h2>
                <p className="text-orange-100">
                  Automatische Benachrichtigungen für deine Links
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Webhook hinzufügen</span>
              </button>
              <button
                onClick={onClose}
                className="p-3 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-colors duration-200"
              >
                <span className="text-white text-2xl">×</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-bold">AKTIV</span>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {webhooks.filter((w) => w.active).length}
              </div>
              <div className="text-green-300">Aktive Webhooks</div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-bold">HEUTE</span>
              </div>
              <div className="text-3xl font-black text-white mb-2">47</div>
              <div className="text-blue-300">Benachrichtigungen</div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-purple-400 text-sm font-bold">
                  GESAMT
                </span>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {webhooks.reduce((sum, w) => sum + w.totalCalls, 0)}
              </div>
              <div className="text-purple-300">Webhook Calls</div>
            </div>
          </div>

          {/* Webhooks List */}
          <div className="space-y-6">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        webhook.active
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : "bg-gray-600"
                      }`}
                    >
                      <Webhook className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {webhook.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>
                            {
                              webhookFormats.find(
                                (f) => f.id === webhook.format
                              )?.name
                            }
                          </span>
                        </span>
                        <span>{webhook.events.length} Events</span>
                        <span>{webhook.totalCalls} Calls</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleTestWebhook(webhook.id)}
                      disabled={testingWebhook === webhook.id}
                      className="p-3 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-all duration-200 disabled:opacity-50"
                    >
                      {testingWebhook === webhook.id ? (
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TestTube className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => setEditingWebhook(webhook)}
                      className="p-3 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/30 transition-all duration-200"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleToggleWebhook(webhook.id)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        webhook.active
                          ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                          : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                      }`}
                    >
                      {webhook.active ? "Aktiv" : "Inaktiv"}
                    </button>

                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="p-3 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Webhook URL</p>
                    <code className="block bg-gray-900/50 p-3 rounded-lg text-gray-300 text-sm break-all">
                      {webhook.url}
                    </code>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Events ({webhook.events.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((eventId) => {
                        const event = availableEvents.find(
                          (e) => e.id === eventId
                        );
                        return (
                          <span
                            key={eventId}
                            className="px-3 py-1 bg-orange-600/20 text-orange-300 text-xs rounded-lg border border-orange-500/30"
                          >
                            {event?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {webhook.lastTriggered && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <p className="text-gray-400 text-sm">
                      Zuletzt ausgelöst:{" "}
                      {new Date(webhook.lastTriggered).toLocaleString("de-DE")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Webhook Form */}
          {showAddForm && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowAddForm(false)}
              />
              <div className="relative bg-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Neuen Webhook hinzufügen
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newWebhook.name || ""}
                      onChange={(e) =>
                        setNewWebhook((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="z.B. Discord Notifications"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={newWebhook.url || ""}
                      onChange={(e) =>
                        setNewWebhook((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">
                      Format
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {webhookFormats.map((format) => (
                        <button
                          key={format.id}
                          onClick={() =>
                            setNewWebhook((prev) => ({
                              ...prev,
                              format: format.id as any,
                            }))
                          }
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            newWebhook.format === format.id
                              ? "border-orange-500 bg-orange-500/20"
                              : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-2xl mb-2">{format.icon}</div>
                          <div className="text-white font-medium text-sm">
                            {format.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4">
                      Events auswählen
                    </label>
                    <div className="space-y-3">
                      {availableEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            (newWebhook.events || []).includes(event.id)
                              ? "border-orange-500 bg-orange-500/20"
                              : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                          }`}
                          onClick={() => toggleEvent(event.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold">
                                {event.name}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {event.description}
                              </p>
                            </div>
                            {(newWebhook.events || []).includes(event.id) && (
                              <CheckCircle className="w-6 h-6 text-orange-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleAddWebhook}
                      disabled={
                        !newWebhook.name ||
                        !newWebhook.url ||
                        !newWebhook.events?.length
                      }
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-2xl font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Webhook erstellen
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-2xl font-bold hover:bg-gray-700 transition-all duration-300"
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
    </div>
  );
};
