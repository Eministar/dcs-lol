import React, {useEffect, useMemo, useState} from 'react';
import {Check, ChevronLeft, ChevronRight, Copy, ExternalLink, RefreshCw, Search, X} from 'lucide-react';

interface LinkItem {
    id: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
    createdAt: string;
}

interface ApiResponse {
    items: LinkItem[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
}

export const LinksModal: React.FC<Props> = ({open, onClose}) => {
    const [items, setItems] = useState<LinkItem[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [q, setQ] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState<'createdAt' | 'clicks' | 'id'>('createdAt');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [copiedShort, setCopiedShort] = useState('');

    const query = useMemo(
        () =>
            new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                q,
                sortBy,
                order,
            }).toString(),
        [page, limit, q, sortBy, order]
    );

    useEffect(() => {
        const t = setTimeout(() => setQ(searchInput), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        if (!open) return;
        const controller = new AbortController();
        setError('');
        setLoading(true);
        fetch(`/api/links?${query}`, {signal: controller.signal})
            .then(async (res) => {
                if (!res.ok) {
                    const msg = await res.text().catch(() => '');
                    throw new Error(msg || `Fehler ${res.status}`);
                }
                return res.json();
            })
            .then((data: ApiResponse) => {
                setItems(data.items);
                setPage(data.page);
                setLimit(data.limit);
                setTotalPages(data.totalPages);
                setTotal(data.total);
            })
            .catch((e) => setError(e?.message || 'Fehler beim Laden'))
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, [open, query, reloadKey]);

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedShort(text);
            setTimeout(() => setCopiedShort(''), 1500);
        } catch {
            // ignore
        }
    };

    const toSortBy = (v: string): 'createdAt' | 'clicks' | 'id' => {
        if (v === 'clicks' || v === 'id') return v;
        return 'createdAt';
    };

    const toOrder = (v: string): 'asc' | 'desc' => (v === 'asc' ? 'asc' : 'desc');

    const truncate = (url: string, len = 48) =>
        url.length > len ? url.slice(0, len - 1) + '…' : url;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose}/>

            {/* Modal */}
            <div
                className="relative z-10 w-full max-w-6xl max-h-[92dvh] bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
                    <h2 className="font-display text-xl sm:text-2xl text-foreground">Alle Links</h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setReloadKey((k) => k + 1)}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/80 transition-all"
                            title="Neu laden"
                        >
                            <RefreshCw className="w-4 h-4"/>
                            <span className="hidden sm:inline">Neu laden</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground"/>
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="px-4 sm:px-6 py-4 border-b border-border">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative flex-1 lg:max-w-md">
                            <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2"/>
                            <input
                                value={searchInput}
                                onChange={(e) => {
                                    setPage(1);
                                    setSearchInput(e.target.value);
                                }}
                                placeholder="Suchen nach ID oder URL..."
                                className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(toSortBy(e.target.value))}
                                className="bg-background border border-border rounded-xl px-3 sm:px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="createdAt">Neueste</option>
                                <option value="clicks">Klicks</option>
                                <option value="id">ID</option>
                            </select>
                            <select
                                value={order}
                                onChange={(e) => setOrder(toOrder(e.target.value))}
                                className="bg-background border border-border rounded-xl px-3 sm:px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="desc">Absteigend</option>
                                <option value="asc">Aufsteigend</option>
                            </select>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setPage(1);
                                    setLimit(parseInt(e.target.value));
                                }}
                                className="bg-background border border-border rounded-xl px-3 sm:px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {error && (
                        <div
                            className="mx-4 sm:mx-6 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="min-w-[900px]">
                        <table className="min-w-full">
                            <thead>
                            <tr className="bg-accent/50 text-muted-foreground text-sm">
                                <th className="text-left px-4 sm:px-6 py-4 font-medium">Kurz-ID</th>
                                <th className="text-left px-4 sm:px-6 py-4 font-medium">Kurzlink</th>
                                <th className="text-left px-4 sm:px-6 py-4 font-medium">Original URL</th>
                                <th className="text-left px-4 sm:px-6 py-4 font-medium">Klicks</th>
                                <th className="text-left px-4 sm:px-6 py-4 font-medium">Erstellt</th>
                                <th className="px-4 sm:px-6 py-4 font-medium">Aktion</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <tr key={i} className="border-t border-border">
                                        <td colSpan={6} className="px-4 sm:px-6 py-4">
                                            <div className="animate-pulse flex gap-4">
                                                <div className="h-4 bg-accent rounded w-16"/>
                                                <div className="h-4 bg-accent rounded w-32"/>
                                                <div className="h-4 bg-accent rounded flex-1"/>
                                                <div className="h-4 bg-accent rounded w-12"/>
                                                <div className="h-4 bg-accent rounded w-24"/>
                                                <div className="h-4 bg-accent rounded w-20"/>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-muted-foreground">
                                        Keine Links gefunden
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id}
                                        className="border-t border-border hover:bg-accent/30 transition-colors">
                                        <td className="px-4 sm:px-6 py-4 font-mono text-sm text-muted-foreground">{item.id}</td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <code
                                                className="text-primary font-mono text-sm bg-primary/5 px-2 py-1 rounded border border-primary/20">
                                                {item.shortUrl}
                                            </code>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-foreground/70 text-sm"
                                            title={item.originalUrl}>
                                            {truncate(item.originalUrl)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-foreground font-medium">{item.clicks}</td>
                                        <td className="px-4 sm:px-6 py-4 text-muted-foreground text-sm">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => copy(item.shortUrl)}
                                                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        copiedShort === item.shortUrl
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                                                    }`}
                                                >
                                                    {copiedShort === item.shortUrl ? <Check className="w-4 h-4"/> :
                                                        <Copy className="w-4 h-4"/>}
                                                    <span
                                                        className="hidden sm:inline">{copiedShort === item.shortUrl ? 'Kopiert' : 'Kopieren'}</span>
                                                </button>
                                                <a
                                                    href={item.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg text-sm font-medium transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4"/>
                                                    <span className="hidden sm:inline">Öffnen</span>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-muted-foreground text-sm">
            Seite {page} von {totalPages} • {total} Links
          </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="p-2 bg-accent rounded-lg hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4"/>
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="p-2 bg-accent rounded-lg hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinksModal;
