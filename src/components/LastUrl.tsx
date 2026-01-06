import React, {useEffect, useMemo, useState} from 'react';
import {Check, ChevronLeft, ChevronRight, Clock, Copy, ExternalLink, TrendingUp} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';

interface RecentLink {
    id: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
    createdAt: string;
}

interface LastUrlProps {
    openLinksModal?: () => void;
}

export const LastUrl: React.FC<LastUrlProps> = ({openLinksModal}) => {
    const {t} = useLanguage();
    const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const pageSize = 9;

    const refetch = () => {
        fetch('/api/recents?limit=45')
            .then(res => res.json())
            .then((data: RecentLink[]) => setRecentLinks(data || []))
            .catch(err => console.error('Fehler beim Laden der Links:', err));
    };

    useEffect(() => {
        refetch();
    }, []);

    useEffect(() => {
        const handler = () => refetch();
        window.addEventListener('link-created', handler as EventListener);
        const iv = setInterval(() => refetch(), 30000);
        return () => {
            window.removeEventListener('link-created', handler as EventListener);
            clearInterval(iv);
        };
    }, []);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(recentLinks.length / pageSize));
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [recentLinks, currentPage]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(recentLinks.length / pageSize)), [recentLinks]);
    const start = (currentPage - 1) * pageSize;
    const visibleLinks = recentLinks.slice(start, start + pageSize);

    const copyToClipboard = async (url: string, id: string) => {
        try {
            await navigator.clipboard.writeText(url.startsWith('http') ? url : `https://${url}`);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Copy-Fehler:', err);
        }
    };

    const fmtRelative = (iso: string) => {
        try {
            const d = new Date(iso);
            const diffMs = Date.now() - d.getTime();
            const rtf = new Intl.RelativeTimeFormat(navigator.language || 'de-DE', {numeric: 'auto'});
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
        <section className="py-32 relative overflow-hidden" style={{backgroundColor: '#0b1120'}}>
            {/* Decorative element */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-border to-transparent"/>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
          <span
              className="inline-block px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium tracking-wide mb-8">
            Recent Links
          </span>
                    <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
                        {t('recentTitle')}{' '}
                        <span className="italic text-primary">{t('recentSubtitle')}</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('recentDescription')}
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleLinks.map((link, index) => (
                        <article
                            key={link.id}
                            className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
                            style={{animationDelay: `${index * 50}ms`}}
                        >
                            {/* Meta */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Clock className="w-4 h-4"/>
                                    <span
                                        title={new Date(link.createdAt).toLocaleString()}>{fmtRelative(link.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary">
                                    <TrendingUp className="w-4 h-4"/>
                                    <span className="text-sm font-semibold">{link.clicks}</span>
                                </div>
                            </div>

                            {/* URLs */}
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{t('original')}</p>
                                    <div
                                        className="text-foreground/70 text-sm bg-background px-3 py-2 rounded-lg border border-border overflow-hidden">
                                        <div className="truncate" title={link.originalUrl}>
                                            {link.originalUrl}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{t('shortened')}</p>
                                    <div className="flex items-center gap-2">
                                        <code
                                            className="flex-1 text-primary font-mono text-sm bg-primary/5 px-3 py-2 rounded-lg border border-primary/20 truncate">
                                            {link.shortUrl}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(link.shortUrl, link.id)}
                                            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                            title="Kopieren"
                                        >
                                            {copiedId === link.id ? <Check className="w-4 h-4"/> :
                                                <Copy className="w-4 h-4"/>}
                                        </button>
                                        <a
                                            href={link.shortUrl.startsWith('http') ? link.shortUrl : `https://${link.shortUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-accent text-accent-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                            title="Öffnen"
                                        >
                                            <ExternalLink className="w-4 h-4"/>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{t('clicksToday')}</span>
                                    <span className="text-primary font-semibold">+{Math.floor(link.clicks * 0.1)}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Pagination */}
                {recentLinks.length > pageSize && (
                    <div className="flex items-center justify-center gap-4 mt-12">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4"/>
                            <span className="hidden sm:inline">Zurück</span>
                        </button>
                        <span className="text-muted-foreground text-sm">
              Seite {currentPage} von {totalPages}
            </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="hidden sm:inline">Weiter</span>
                            <ChevronRight className="w-4 h-4"/>
                        </button>
                    </div>
                )}

                {/* CTA */}
                <div className="text-center mt-16">
                    {openLinksModal ? (
                        <button
                            onClick={openLinksModal}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all"
                        >
                            {t('showAll')}
                        </button>
                    ) : null}
                </div>
            </div>
        </section>
    );
};
