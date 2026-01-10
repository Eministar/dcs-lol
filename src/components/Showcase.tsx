import React, {useEffect, useState} from 'react';
import {AlertCircle, CheckCircle, Crown, Eye, Flag, Heart, Image, Link2, Search, Star, Upload, X} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';
import {useAuth} from '../contexts/AuthContext';

interface ServerData {
    name: string;
    description: string;
    logo: File | null;
    inviteLink: string;
    category: string;
    tags: string[];
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
    memberCount?: number;
    views?: number;
    avgRating?: number;
    ratingCount?: number;
    favoriteCount?: number;
}

const categories = [
    'Gaming',
    'Tech',
    'Art',
    'Music',
    'Education',
    'Community',
    'Business',
    'Other'
];

export const Showcase: React.FC = () => {
    const {t} = useLanguage();
    const {user} = useAuth();

    const [entries, setEntries] = useState<ShowcaseEntry[]>([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [serverData, setServerData] = useState<ServerData>({
        name: '',
        description: '',
        logo: null,
        inviteLink: '',
        category: '',
        tags: []
    });
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // New state for rating and details
    const [selectedServer, setSelectedServer] = useState<ShowcaseEntry | null>(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);
    const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
    const [filterCategory, setFilterCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'views' | 'favorites'>('newest');
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    useEffect(() => {
        fetch('/api/showcase')
            .then(res => res.json() as Promise<unknown>)
            .then((data) => {
                const rawList: unknown[] = Array.isArray(data) ? data : [];

                // Backend liefert teils verschachtelte Listen; wir flatten 1 Level defensiv
                const list: unknown[] = rawList.length > 0 && Array.isArray(rawList[0])
                    ? (rawList[0] as unknown[]).concat(...(rawList as unknown[][]))
                    : rawList;

                const normalized: ShowcaseEntry[] = list
                    .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
                    .map((x) => {
                        const tags = Array.isArray(x.tags) ? x.tags.filter((t): t is string => typeof t === 'string') : [];
                        return {
                            id: String(x.id || ''),
                            name: String(x.name || ''),
                            description: typeof x.description === 'string' ? x.description : '',
                            inviteLink: String(x.inviteLink || ''),
                            category: String(x.category || ''),
                            tags,
                            logoUrl: String(x.logoUrl || ''),
                            createdAt: x.createdAt ? new Date(String(x.createdAt)).toISOString() : new Date().toISOString(),
                            featured: Boolean(x.featured),
                            verified: Boolean(x.verified),
                        };
                    });
                const sorted = normalized.sort((a, b) => {
                    if (a.featured === b.featured) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return a.featured ? -1 : 1;
                });
                setEntries(sorted);
            })
            .catch(err => console.error('Fehler beim Laden der Showcase-Einträge:', err));
    }, []);

    const validateDcsLink = (link: string) =>
        /^dcs\.lol\/[A-Za-z0-9_-]+$/.test(link);

    // Handle rating submission
    const handleRateServer = async () => {
        if (!user || !selectedServer || userRating === 0) return;
        setRatingLoading(true);
        try {
            const res = await fetch(`/api/showcase/${selectedServer.id}/rate`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({rating: userRating, review: reviewText})
            });
            if (res.ok) {
                const data = await res.json();
                setEntries(prev => prev.map(e =>
                    e.id === selectedServer.id
                        ? {...e, avgRating: data.avgRating, ratingCount: data.ratingCount}
                        : e
                ));
                setShowRatingModal(false);
                setUserRating(0);
                setReviewText('');
            }
        } catch (err) {
            console.error('Rating error:', err);
        } finally {
            setRatingLoading(false);
        }
    };

    // Handle favorite toggle
    const handleToggleFavorite = async (serverId: string) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/showcase/${serverId}/favorite`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setUserFavorites(prev => {
                    const next = new Set(prev);
                    if (data.favorited) {
                        next.add(serverId);
                    } else {
                        next.delete(serverId);
                    }
                    return next;
                });
                setEntries(prev => prev.map(e =>
                    e.id === serverId
                        ? {...e, favoriteCount: (e.favoriteCount || 0) + (data.favorited ? 1 : -1)}
                        : e
                ));
            }
        } catch (err) {
            console.error('Favorite error:', err);
        }
    };

    // Handle report submission
    const handleReportServer = async () => {
        if (!user || !selectedServer || !reportReason) return;
        try {
            const res = await fetch(`/api/showcase/${selectedServer.id}/report`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({reason: reportReason})
            });
            if (res.ok) {
                setShowReportModal(false);
                setReportReason('');
                alert(t('reportSuccess') || 'Danke für deine Meldung!');
            }
        } catch (err) {
            console.error('Report error:', err);
        }
    };

    // Filter and sort entries
    const filteredEntries = entries
        .filter(e => {
            if (filterCategory && e.category !== filterCategory) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return e.name.toLowerCase().includes(q) ||
                    e.description.toLowerCase().includes(q) ||
                    e.tags.some(t => t.toLowerCase().includes(q));
            }
            return true;
        })
        .sort((a, b) => {
            if (a.featured !== b.featured) return a.featured ? -1 : 1;
            switch (sortBy) {
                case 'rating':
                    return (b.avgRating || 0) - (a.avgRating || 0);
                case 'views':
                    return (b.views || 0) - (a.views || 0);
                case 'favorites':
                    return (b.favoriteCount || 0) - (a.favoriteCount || 0);
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    const addTag = (tag: string) => {
        if (tag && !serverData.tags.includes(tag) && serverData.tags.length < 5) {
            setServerData(prev => ({...prev, tags: [...prev.tags, tag.trim()]}));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setServerData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
    };

    const validateForm = () => {
        const errs: Record<string, string> = {};
        if (!serverData.name.trim()) errs.name = t('serverNameRequired');
        if (!serverData.description.trim()) errs.description = t('descriptionRequired');
        if (!serverData.logo) errs.logo = t('logoRequired');
        if (!serverData.inviteLink.trim() || !validateDcsLink(serverData.inviteLink)) {
            errs.inviteLink = t('invalidDcsLink');
        }
        if (!serverData.category) errs.category = t('categoryRequired');
        if (serverData.tags.length > 5) errs.tags = t('tagsTooMany');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setServerData(prev => ({...prev, logo: file}));
            setErrors(prev => ({...prev, logo: ''}));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file && file.type.startsWith('image/')) {
            setServerData(prev => ({...prev, logo: file}));
            setErrors(prev => ({...prev, logo: ''}));
        }
    };

    const renderMarkdown = (text: string) =>
        text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br />');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', serverData.name);
        formData.append('description', serverData.description);
        formData.append('inviteLink', serverData.inviteLink);
        formData.append('category', serverData.category);
        formData.append('tags', JSON.stringify(serverData.tags));
        if (serverData.logo) formData.append('logo', serverData.logo);

        try {
            const res = await fetch('/api/showcase', {
                method: 'POST',
                body: formData
            });
            const json = await res.json();
            if (!res.ok) {
                const msg = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
                setErrors({form: msg});
            } else {
                setEntries(prev => [json as ShowcaseEntry, ...prev]);
                setSubmitSuccess(true);
                setTimeout(() => {
                    setShowUploadForm(false);
                    setSubmitSuccess(false);
                    setServerData({
                        name: '',
                        description: '',
                        logo: null,
                        inviteLink: '',
                        category: '',
                        tags: []
                    });
                    setErrors({});
                }, 2000);
            }
        } catch (err) {
            console.error(err);
            setErrors({form: t('uploadFailed')});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-32 relative overflow-hidden" style={{backgroundColor: '#0b1120'}}>
            {/* Subtle grid background */}
            <div className="absolute inset-0 opacity-[0.03] bg-grid-soft"/>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
          <span
              className="inline-block px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium tracking-wide mb-8">
            Showcase
          </span>
                    <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6">
                        {t('showcaseTitle')}{' '}
                        <span className="italic text-primary">{t('showcaseSubtitle')}</span>
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
                        {t('showcaseDescription')}
                    </p>
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300"
                    >
                        <Upload className="w-5 h-5"/>
                        <span>{t('uploadServer')}</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="mb-10 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={t('searchServers') || 'Server suchen...'}
                                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as 'newest' | 'rating' | 'views' | 'favorites')}
                            className="px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="newest">{t('sortNewest') || 'Neueste'}</option>
                            <option value="rating">{t('sortRating') || 'Beste Bewertung'}</option>
                            <option value="views">{t('sortViews') || 'Meiste Aufrufe'}</option>
                            <option value="favorites">{t('sortFavorites') || 'Beliebteste'}</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterCategory('')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                !filterCategory
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                            }`}
                        >
                            {t('all') || 'Alle'}
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    filterCategory === cat
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Entries Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {filteredEntries.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground text-lg">
                                {searchQuery || filterCategory
                                    ? (t('noServersFound') || 'Keine Server gefunden')
                                    : (t('noServersYet') || 'Noch keine Server vorhanden')}
                            </p>
                        </div>
                    ) : filteredEntries.map((entry, idx) => (
                        <article
                            key={entry.id}
                            className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
                            style={{animationDelay: `${idx * 100}ms`}}
                        >
                            {/* Featured badge */}
                            {entry.featured && (
                                <div
                                    className="absolute -top-3 -right-3 flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                                    <Crown className="w-3 h-3"/>
                                    <span>FEATURED</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div
                                className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {user && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(entry.id);
                                            }}
                                            className={`p-2 rounded-lg transition-all ${
                                                userFavorites.has(entry.id)
                                                    ? 'bg-red-500/20 text-red-500'
                                                    : 'bg-accent hover:bg-accent/80 text-muted-foreground'
                                            }`}
                                            title={t('favorite') || 'Favorisieren'}
                                        >
                                            <Heart
                                                className={`w-4 h-4 ${userFavorites.has(entry.id) ? 'fill-current' : ''}`}/>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedServer(entry);
                                                setShowReportModal(true);
                                            }}
                                            className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-muted-foreground transition-all"
                                            title={t('report') || 'Melden'}
                                        >
                                            <Flag className="w-4 h-4"/>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={entry.logoUrl}
                                    alt={entry.name}
                                    className="w-14 h-14 rounded-xl object-cover border border-border group-hover:border-primary/30 transition-colors duration-300"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 truncate">
                                        {entry.name}
                                        {entry.verified && (
                                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0"/>
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <span>{entry.category}</span>
                                        {entry.views !== undefined && entry.views > 0 && (
                                            <>
                                                <span className="text-border">•</span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3"/>
                                                    {entry.views}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div
                                className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3"
                                dangerouslySetInnerHTML={{__html: renderMarkdown(entry.description)}}
                            />

                            {/* Tags */}
                            {entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {entry.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-lg cursor-pointer hover:bg-primary/20"
                                            onClick={() => setSearchQuery(tag)}
                                        >
                      {tag}
                    </span>
                                    ))}
                                </div>
                            )}

                            {/* Footer with Rating */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.round(entry.avgRating || 0) ? 'text-primary fill-primary' : 'text-muted'}`}
                                        />
                                    ))}
                                    <span className="text-muted-foreground text-sm ml-2">
                                        {entry.avgRating?.toFixed(1) || '0.0'}
                                        {entry.ratingCount !== undefined && entry.ratingCount > 0 && (
                                            <span className="text-xs"> ({entry.ratingCount})</span>
                                        )}
                                    </span>
                                    {user && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedServer(entry);
                                                setShowRatingModal(true);
                                            }}
                                            className="ml-2 text-xs text-primary hover:underline"
                                        >
                                            {t('rate') || 'Bewerten'}
                                        </button>
                                    )}
                                </div>
                                <a
                                    href={`https://${entry.inviteLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg text-sm font-medium transition-all duration-300"
                                >
                                    <span>{t('joinServer')}</span>
                                    <Link2 className="w-4 h-4"/>
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Upload Modal */}
                {showUploadForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                            onClick={() => setShowUploadForm(false)}
                        />
                        <div className="absolute inset-0 opacity-[0.04] bg-grid-soft pointer-events-none"/>
                        <div
                            className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-primary"/>
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {t('uploadYourServer')}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowUploadForm(false)}
                                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground"/>
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                {submitSuccess ? (
                                    <div className="text-center py-12">
                                        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4"/>
                                        <h4 className="text-2xl font-semibold text-foreground mb-2">
                                            {t('uploadSuccess')}
                                        </h4>
                                        <p className="text-muted-foreground">{t('uploadSuccessDesc')}</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {errors.form && (
                                            <div
                                                className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                                                {errors.form}
                                            </div>
                                        )}

                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                {t('serverName')} <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={serverData.name}
                                                onChange={e => setServerData(prev => ({...prev, name: e.target.value}))}
                                                placeholder={t('serverNamePlaceholder')}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                            {errors.name && (
                                                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4"/>
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Logo */}
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                {t('serverLogo')} <span className="text-destructive">*</span>
                                            </label>
                                            <div
                                                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                                                    dragActive
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileInput}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                {serverData.logo ? (
                                                    <div className="flex items-center justify-center gap-4">
                                                        <img
                                                            src={URL.createObjectURL(serverData.logo)}
                                                            alt="Preview"
                                                            className="w-14 h-14 rounded-xl object-cover"
                                                        />
                                                        <div className="text-left">
                                                            <p className="text-primary font-medium">{serverData.logo.name}</p>
                                                            <p className="text-muted-foreground text-sm">Klicke zum
                                                                Ändern</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Image className="w-10 h-10 text-muted-foreground mx-auto"/>
                                                        <p className="text-muted-foreground">
                                                            Bild hierher ziehen oder <span
                                                            className="text-primary">durchsuchen</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.logo && (
                                                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4"/>
                                                    {errors.logo}
                                                </p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                {t('description')} <span className="text-destructive">*</span>
                                            </label>
                                            <textarea
                                                value={serverData.description}
                                                onChange={e => setServerData(prev => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))}
                                                placeholder={t('descriptionPlaceholder')}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                            />
                                            {errors.description && (
                                                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4"/>
                                                    {errors.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Invite Link */}
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                {t('dcsLink')} <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={serverData.inviteLink}
                                                onChange={e => setServerData(prev => ({
                                                    ...prev,
                                                    inviteLink: e.target.value
                                                }))}
                                                placeholder="dcs.lol/dein-server"
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                                            />
                                            {errors.inviteLink && (
                                                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4"/>
                                                    {errors.inviteLink}
                                                </p>
                                            )}
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                {t('category')} <span className="text-destructive">*</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setServerData(prev => ({
                                                            ...prev,
                                                            category: cat
                                                        }))}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                            serverData.category === cat
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-accent text-accent-foreground hover:bg-accent/80'
                                                        }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.category && (
                                                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4"/>
                                                    {errors.category}
                                                </p>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Tags (max 5)
                                            </label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {serverData.tags.map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                                                    >
                            {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="hover:text-destructive"
                                                        >
                              <X className="w-3 h-3"/>
                            </button>
                          </span>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Tag eingeben und Enter drücken"
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addTag((e.target as HTMLInputElement).value);
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div
                                                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"/>
                                                    <span>Wird hochgeladen...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5"/>
                                                    <span>{t('uploadServer')}</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Rating Modal */}
                {showRatingModal && selectedServer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                            onClick={() => setShowRatingModal(false)}
                        />
                        <div
                            className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground"/>
                            </button>

                            <div className="text-center mb-6">
                                <img
                                    src={selectedServer.logoUrl}
                                    alt={selectedServer.name}
                                    className="w-16 h-16 rounded-xl object-cover mx-auto mb-4 border border-border"
                                />
                                <h3 className="text-xl font-semibold text-foreground">
                                    {t('rateServer') || 'Server bewerten'}
                                </h3>
                                <p className="text-muted-foreground">{selectedServer.name}</p>
                            </div>

                            {/* Star Rating */}
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setUserRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-colors ${
                                                star <= (hoverRating || userRating)
                                                    ? 'text-primary fill-primary'
                                                    : 'text-muted'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Review Text */}
                            <textarea
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                                placeholder={t('reviewPlaceholder') || 'Schreibe eine Bewertung (optional)...'}
                                rows={3}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none mb-4"
                            />

                            <button
                                onClick={handleRateServer}
                                disabled={userRating === 0 || ratingLoading}
                                className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {ratingLoading ? (
                                    <div
                                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"/>
                                ) : (
                                    <>
                                        <Star className="w-5 h-5"/>
                                        <span>{t('submitRating') || 'Bewertung abgeben'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Report Modal */}
                {showReportModal && selectedServer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                            onClick={() => setShowReportModal(false)}
                        />
                        <div
                            className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground"/>
                            </button>

                            <div className="text-center mb-6">
                                <div
                                    className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Flag className="w-6 h-6 text-destructive"/>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">
                                    {t('reportServer') || 'Server melden'}
                                </h3>
                                <p className="text-muted-foreground">{selectedServer.name}</p>
                            </div>

                            {/* Report Reasons */}
                            <div className="space-y-2 mb-6">
                                {[
                                    {id: 'spam', label: t('reportSpam') || 'Spam'},
                                    {id: 'inappropriate', label: t('reportInappropriate') || 'Unangemessener Inhalt'},
                                    {id: 'scam', label: t('reportScam') || 'Betrug/Scam'},
                                    {id: 'copyright', label: t('reportCopyright') || 'Urheberrechtsverletzung'},
                                    {id: 'other', label: t('reportOther') || 'Sonstiges'}
                                ].map(reason => (
                                    <button
                                        key={reason.id}
                                        onClick={() => setReportReason(reason.id)}
                                        className={`w-full px-4 py-3 text-left rounded-xl border transition-all ${
                                            reportReason === reason.id
                                                ? 'border-primary bg-primary/10 text-foreground'
                                                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                        }`}
                                    >
                                        {reason.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleReportServer}
                                disabled={!reportReason}
                                className="w-full py-3 bg-destructive text-destructive-foreground font-medium rounded-xl hover:bg-destructive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('submitReport') || 'Meldung absenden'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
