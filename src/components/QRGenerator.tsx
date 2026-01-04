import React, { useState, useEffect } from "react";
import {
  QrCode,
  Download,
  Copy,
  CheckCircle,
  Zap,
  Sparkles,
  Share2,
} from "lucide-react";
import QRCodeLib from "qrcode";
import { useLanguage } from "../contexts/LanguageContext";

interface QRGeneratorProps {
  url?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  url,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [customUrl, setCustomUrl] = useState(url || "");
  const [qrStyle, setQrStyle] = useState("default");
  const [qrSize, setQrSize] = useState(512);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const qrStyles = [
    {
      id: "default",
      name: "Standard",
      colors: { dark: "#000000", light: "#FFFFFF" },
    },
    {
      id: "purple",
      name: "Purple Glow",
      colors: { dark: "#8B5CF6", light: "#F3F4F6" },
    },
    {
      id: "blue",
      name: "Ocean Blue",
      colors: { dark: "#3B82F6", light: "#EFF6FF" },
    },
    {
      id: "green",
      name: "Matrix Green",
      colors: { dark: "#10B981", light: "#ECFDF5" },
    },
    {
      id: "pink",
      name: "Neon Pink",
      colors: { dark: "#EC4899", light: "#FDF2F8" },
    },
    {
      id: "gradient",
      name: "Discord Style",
      colors: { dark: "#5865F2", light: "#F8FAFC" },
    },
  ];

  useEffect(() => {
    if (customUrl && isOpen) {
      generateQR();
    }
  }, [customUrl, qrStyle, qrSize, isOpen]);

  const generateQR = async () => {
    if (!customUrl) return;

    try {
      const style = qrStyles.find((s) => s.id === qrStyle) || qrStyles[0];
      const dataUrl = await QRCodeLib.toDataURL(customUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: style.colors.dark,
          light: style.colors.light,
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("QR Code generation failed:", error);
    }
  };

  const downloadQR = async () => {
    if (!qrDataUrl) return;

    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.download = `dcs-lol-qr-${Date.now()}.png`;
      link.href = qrDataUrl;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const copyQRImage = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
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
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">
                  QR Code Generator
                </h2>
                <p className="text-purple-100">
                  Erstelle stylische QR Codes für deine Links
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-colors duration-200"
            >
              <span className="text-white text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Settings */}
            <div className="space-y-8">
              <div>
                <label className="block text-white font-bold mb-4 text-lg">
                  Link URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://dcs.lol/meinserver"
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-600 rounded-2xl text-white text-lg focus:border-purple-500 focus:outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-4 text-lg">
                  QR Code Style
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {qrStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setQrStyle(style.id)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        qrStyle === style.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg mx-auto mb-2"
                        style={{ backgroundColor: style.colors.dark }}
                      ></div>
                      <span className="text-white text-sm font-medium">
                        {style.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-4 text-lg">
                  Größe: {qrSize}px
                </label>
                <input
                  type="range"
                  min="256"
                  max="1024"
                  step="128"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-gray-400 text-sm mt-2">
                  <span>256px</span>
                  <span>512px</span>
                  <span>1024px</span>
                </div>
              </div>

              <button
                onClick={generateQR}
                disabled={!customUrl}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <Zap className="w-6 h-6" />
                <span>QR Code generieren</span>
              </button>
            </div>

            {/* Preview */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center space-x-3">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <span>Vorschau</span>
                </h3>

                {qrDataUrl ? (
                  <div className="bg-white p-8 rounded-3xl shadow-2xl inline-block">
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="max-w-full h-auto rounded-2xl shadow-lg"
                      style={{ maxWidth: "300px" }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-3xl p-16 text-center">
                    <QrCode className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      QR Code wird hier angezeigt
                    </p>
                  </div>
                )}
              </div>

              {qrDataUrl && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={downloadQR}
                    disabled={downloading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                  >
                    {downloading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    <span>{downloading ? "Lädt..." : "Download"}</span>
                  </button>

                  <button
                    onClick={copyQRImage}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-2xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                    <span>{copied ? "Kopiert!" : "Kopieren"}</span>
                  </button>
                </div>
              )}

              {qrDataUrl && (
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <Share2 className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-bold">Verwendung</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Teile diesen QR Code auf Flyern, Postern, Social Media oder
                    überall wo Menschen deinen Discord-Server finden sollen. Ein
                    Scan führt direkt zu deinem Server!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
