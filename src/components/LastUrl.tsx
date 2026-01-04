import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Copy, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RecentLink {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string; // ISO string
}

interface LastUrlProps { openLinksModal?: () => void }
export const LastUrl: React.FC<LastUrlProps> = ({ openLinksModal }) => {
  const { t } = useLanguage();
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const refetch = () => {
    fetch('/api/recents?limit=45')
      .then(res => res.json())
      .then((data: RecentLink[]) => {
        setRecentLinks(data || []);
      })
      .catch(err => console.error('Fehler beim Laden der Links:', err));
  };

  useEffect(() => { refetch(); }, []);

  // Live-Updates: bei Link-Erstellung und leichtes Polling
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('link-created', handler as EventListener);
    const iv = setInterval(() => refetch(), 30000);
    return () => {
      window.removeEventListener('link-created', handler as EventListener);
      clearInterval(iv);
    };
  }, []);

  // Korrigiere Seite wenn Daten sich ändern
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(recentLinks.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [recentLinks, currentPage]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(recentLinks.length / pageSize)), [recentLinks]);
  const start = (currentPage - 1) * pageSize;
  const visibleLinks = recentLinks.slice(start, start + pageSize);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url.startsWith('http') ? url : `https://${url}`);
    } catch (err) {
      console.error('Copy-Fehler:', err);
    }
  };

  const fmtRelative = (iso: string) => {
    try {
      const d = new Date(iso);
      const diffMs = Date.now() - d.getTime();
      const rtf = new Intl.RelativeTimeFormat(navigator.language || 'de-DE', { numeric: 'auto' });
      const minutes = Math.round(diffMs / 60000);
      if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');
      const hours = Math.round(minutes / 60);
      if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
      const days = Math.round(hours / 24);
      return rtf.format(-days, 'day');
    } catch {
      return new Date(iso).toLocaleString();
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            {t('recentTitle')}{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {t('recentSubtitle')}
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            {t('recentDescription')}
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8">
            {visibleLinks.map((link, index) => (
              <div
                key={link.id}
                className="group bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate" title={new Date(link.createdAt).toLocaleString()}>{fmtRelative(link.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-bold">{link.clicks}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('original')}</p>
                    <div className="text-gray-300 text-sm bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700/50 overflow-hidden">
                      <div className="truncate" title={link.originalUrl}>
                        {link.originalUrl}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('shortened')}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 min-w-0">
                        <code className="block text-green-400 font-mono text-sm sm:text-base bg-gray-900/70 px-3 py-2 rounded-lg border border-green-500/30 truncate" title={link.shortUrl}>
                          {link.shortUrl}
                        </code>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(link.shortUrl)}
                          className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all duration-200 group-hover:scale-110"
                          title="Kopieren"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all duration-200 group-hover:scale-110"
                          title="Öffnen"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{t('clicksToday')}</span>
                    <span className="text-green-400 font-bold">+{Math.floor(link.clicks * 0.1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {recentLinks.length > pageSize && (
            <div className="flex items-center justify-between px-4 sm:px-8 mt-8 text-gray-300">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-2 bg-gray-800/70 hover:bg-gray-700 disabled:opacity-40 border border-gray-700 rounded-xl px-3 py-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Zurück</span>
              </button>
              <div>
                Seite {currentPage} von {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-2 bg-gray-800/70 hover:bg-gray-700 disabled:opacity-40 border border-gray-700 rounded-xl px-3 py-2"
              >
                <span>Weiter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          {openLinksModal ? (
            <button onClick={openLinksModal} className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1">
              {t('showAll')}
            </button>
          ) : (
            <span className="text-gray-400 text-sm">Modal nicht verfügbar</span>
          )}
        </div>
      </div>
    </section>
  );
};