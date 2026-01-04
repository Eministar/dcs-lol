import React, { useState } from "react";
import {
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Zap,
  QrCode,
  Webhook,
  Info,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { QRGenerator } from "./QRGenerator";
import { WebhookManager } from "./WebhookManager";
import { useAuth } from "../contexts/AuthContext";
import { Link as RLink } from "react-router-dom";

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [inputUrl, setInputUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showWebhookManager, setShowWebhookManager] = useState(false);

  const validateDiscordUrl = (url: string): boolean => {
    const discordPatterns = [
      /^https:\/\/discord\.gg\/[a-zA-Z0-9]+$/,
      /^https:\/\/discord\.com\/invite\/[a-zA-Z0-9]+$/,
      /^discord\.gg\/[a-zA-Z0-9]+$/,
    ];
    return discordPatterns.some((pattern) => pattern.test(url));
  };

  const shortenUrl = async () => {
    if (!inputUrl.trim()) {
      setError(t("enterUrl"));
      return;
    }

    if (!validateDiscordUrl(inputUrl)) {
      setError(t("invalidUrl"));
      return;
    }

    if (!customId.trim()) {
      setError(t("enterCustom"));
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ originalUrl: inputUrl, customId: customId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unbekannter Fehler");

      setShortenedUrl(data.short);
      // Notify other components to refresh recents
      try { window.dispatchEvent(new Event('link-created')); } catch {}
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Kopieren fehlgeschlagen:", err);
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-full px-4 sm:px-6 py-3">
                <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400" />
                <span className="text-gray-300 font-medium text-sm sm:text-base">
                  {t("fastFree")}
                </span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
              <br />
              <span className="text-white">{t("heroSubtitle")}</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed px-4">
              {t("heroDescription")}{" "}
              <span className="text-purple-400 font-semibold">
                {" "}
                {t("heroHighlight")}
              </span>
            </p>

            {!user && (
              <div className="max-w-3xl mx-auto mb-6 px-4">
                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 text-left">
                  <Info className="w-5 h-5 text-amber-300 mt-0.5" />
                  <div className="text-amber-100 text-sm">
                    <b>Wichtig:</b> Erstelle zuerst einen Account, dann deinen Kurzlink. Links, die <i>ohne</i> Account erstellt werden, können später nicht bearbeitet oder deinem Konto zugeordnet werden. {" "}
                    <RLink to="/register" className="underline text-amber-200 hover:text-amber-100">Jetzt registrieren</RLink>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto mb-20 px-4">
              <div className="bg-gray-800/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl border border-gray-700/50">
                <div className="space-y-6">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder={t("discordPlaceholder")}
                    className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-lg sm:text-xl bg-gray-900/50 border-2 border-gray-600 rounded-2xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                  />
                  <input
                    type="text"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder={t("customPlaceholder")}
                    className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-lg sm:text-xl bg-gray-900/50 border-2 border-gray-600 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                  />

                  {error && (
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={shortenUrl}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 sm:py-5 md:py-6 px-6 sm:px-8 rounded-2xl font-bold text-lg sm:text-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t("creating")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>{t("shortenButton")}</span>
                      </div>
                    )}
                  </button>

                  {shortenedUrl && (
                    <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/30 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                          <span className="text-green-300 font-bold text-base sm:text-lg">
                            {t("yourLink")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                        <code className="flex-1 p-3 sm:p-4 bg-gray-900/70 rounded-xl text-purple-300 font-mono text-base sm:text-lg lg:text-xl border border-gray-600 break-all">
                          {shortenedUrl}
                        </code>
                        <div className="flex space-x-3">
                          <button
                            onClick={copyToClipboard}
                            className="flex-1 sm:flex-none p-3 sm:p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
                          >
                            {copied ? (
                              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <Copy className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </button>
                          <a
                            href={shortenedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none p-3 sm:p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 flex items-center justify-center"
                          >
                            <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
                          </a>
                        </div>
                      </div>

                      {/* New Feature Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-green-500/30">
                        <button
                          onClick={() => setShowQRGenerator(true)}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                        >
                          <QrCode className="w-5 h-5" />
                          <span>QR Code erstellen</span>
                        </button>
                        <button
                          onClick={() => setShowWebhookManager(true)}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                        >
                          <Webhook className="w-5 h-5" />
                          <span>Webhooks</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
              <div className="text-center p-6 sm:p-8 bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="text-3xl sm:text-4xl font-black text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                  100+
                </div>
                <div className="text-gray-300 text-base sm:text-lg">
                  {t("linksShortened")}
                </div>
              </div>
              <div className="text-center p-6 sm:p-8 bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="text-3xl sm:text-4xl font-black text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                  99.9%
                </div>
                <div className="text-gray-300 text-base sm:text-lg">
                  {t("uptime")}
                </div>
              </div>
              <div className="text-center p-6 sm:p-8 bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 group">
                <div className="text-3xl sm:text-4xl font-black text-cyan-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                  ∞
                </div>
                <div className="text-gray-300 text-base sm:text-lg">
                  {t("free")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QRGenerator
        url={shortenedUrl}
        isOpen={showQRGenerator}
        onClose={() => setShowQRGenerator(false)}
      />
      <WebhookManager
        isOpen={showWebhookManager}
        onClose={() => setShowWebhookManager(false)}
      />
    </>
  );
};
