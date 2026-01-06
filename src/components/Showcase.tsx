import React, {useEffect, useState} from 'react';
import {AlertCircle, CheckCircle, Crown, Image, Link2, Star, Upload, X} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';

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

                {/* Entries Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {entries.map((entry, idx) => (
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
                                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                                        <span className="text-border">•</span>
                                        <span>{entry.category}</span>
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
                                            className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-lg"
                                        >
                      {tag}
                    </span>
                                    ))}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < 4 ? 'text-primary fill-primary' : 'text-muted'}`}
                                        />
                                    ))}
                                    <span className="text-muted-foreground text-sm ml-2">4.5</span>
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
            </div>
        </section>
    );
};
