import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, ArrowRight, Zap } from "lucide-react";
import { useParams } from "react-router-dom";

interface ServerInfo {
  name: string;
  icon: string;
  inviteCode: string;
  originalUrl: string;
}

export const Redirect: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const trackedRef = useRef(false);

  useEffect(() => {
    const code = (shortCode || window.location.pathname.split("/")[1] || '').trim();
    if (!code) { setIsLoading(false); return; }
    const loadInfo = async () => {
      try {
        const res = await fetch(`/api/info/${code}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setServerInfo(data);
      } catch {
        setServerInfo(null);
      }
      setIsLoading(false);
    };
    loadInfo();
  }, [shortCode]);

  useEffect(() => {
    if (!isLoading && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && serverInfo) {
      // track exactly once on auto-redirect, then navigate
      if (!trackedRef.current) {
        try { fetch(`/api/click/${serverInfo.inviteCode}`, { method: 'POST' }); } catch {}
        trackedRef.current = true;
      }
      window.location.href = serverInfo.originalUrl;
    }
  }, [countdown, isLoading, serverInfo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-white text-2xl font-bold">Lade Serverdaten...</h2>
          <p className="text-gray-400">Bitte kurz Geduld!</p>
        </div>
      </div>
    );
  }

  if (!serverInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-red-900 flex items-center justify-center px-6">
        <div className="bg-gray-800/60 p-8 rounded-2xl text-center max-w-md w-full space-y-6 shadow-xl border border-red-400/30">
          <h2 className="text-red-400 text-3xl font-bold">Server nicht gefunden</h2>
          <p className="text-gray-300">Dieser Discord-Link ist nicht mehr gültig oder existiert nicht.</p>
          <a
            href="https://dcs.lol"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white relative px-4 py-10 sm:px-6 lg:px-16">
      {/* Hintergrund-Bubbles */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute w-72 h-72 bg-purple-500/20 rounded-full blur-3xl top-16 left-8 animate-blob"></div>
        <div className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl bottom-16 right-8 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-16">
        {/* Hauptkarte */}
        <div className="bg-gray-800/60 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-gray-700/40 shadow-2xl text-center space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
            <img
              src={serverInfo.icon}
              alt={serverInfo.name}
              onError={(e) => { const t = e.currentTarget; if (t.src.indexOf('cdn.discordapp.com') !== -1) { t.src = serverInfo.icon.replace(/\.(?:png|webp)(\?.*)?$/,'\.png$1').replace('size=128','size=64'); } else { t.src = 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png'; } }}
              className="w-24 h-24 rounded-xl border-4 border-purple-500/30 shadow-md"
            />
            <div>
              <h1 className="text-3xl font-bold">{serverInfo.name}</h1>
              <p className="text-purple-300 text-sm">dcs.lol/{serverInfo.inviteCode}</p>
            </div>
          </div>

          <div>
            <div className="text-6xl sm:text-8xl font-black tabular-nums">{countdown}</div>
            <p className="text-gray-300 mt-2">
              Weiterleitung in <span className="text-purple-400 font-bold">{countdown}</span> Sekunden...
            </p>

            <div className="mt-4 w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-linear"
                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={async () => { if (!trackedRef.current) { trackedRef.current = true; try { await fetch(`/api/click/${serverInfo.inviteCode}`, { method: 'POST' }); } catch {} } window.location.href = serverInfo.originalUrl; }}
            className="mt-6 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition text-white font-bold py-3 px-6 rounded-2xl text-lg shadow-xl"
          >
            <ExternalLink className="w-5 h-5" />
            Manuell beitreten
          </button>
        </div>

        {/* Werbung */}
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 p-8 sm:p-12 rounded-3xl border border-purple-500/20 shadow-xl text-center space-y-10">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <Zap className="text-white w-8 h-8" />
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black leading-tight">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">dcs.lol</span>
            <br />
            <span className="text-white">Discord Links verkürzen</span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            Erstelle stylische Kurzlinks für deinen Discord-Server.
            <br />
            <span className="text-purple-300 font-semibold">Kostenlos, schnell und für immer!</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: "⚡", title: "Blitzschnell", desc: "Links in Millisekunden erstellt" },
              { icon: "🔒", title: "Sicher", desc: "99.9% Uptime garantiert" },
              { icon: "📊", title: "Analytics", desc: "Detaillierte Statistiken" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          <a
            href="https://dcs.lol"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition text-white font-black text-xl px-8 py-4 rounded-2xl shadow-xl hover:shadow-purple-500/30"
          >
            Jetzt kostenlos starten <ArrowRight className="w-6 h-6" />
          </a>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-12 text-gray-400 pt-6">
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> 50.000+ Links</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" /> 25.000+ Communities</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" /> 4.9 / 5 Sterne</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm pt-6">
          Powered by <a href="https://dcs.lol" className="text-purple-400 font-semibold hover:text-purple-300">dcs.lol</a> • Der beste Discord-Kurzlink-Service
        </footer>
      </div>
    </div>
  );
};
