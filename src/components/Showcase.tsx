import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image,
  Link2,
  Crown,
  Zap,
  CheckCircle,
  AlertCircle,
  X,
  Star,
  Users
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();

  // State
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
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load existing showcase entries
 useEffect(() => {
  fetch('/api/showcase')
    .then(res => res.json())
    .then((data: any) => {
      // normalize defensively in the client (in case backend isn't restarted yet)
      let list: any[] = Array.isArray(data) ? data : [];
      if (list.length > 0 && Array.isArray(list[0])) {
        try { list = list.flat(1); } catch { list = ([] as any[]).concat(...list); }
      }
      const normalized: ShowcaseEntry[] = list
        .filter((x) => x && typeof x === 'object')
        .map((x) => ({
          id: String(x.id || ''),
          name: String(x.name || ''),
          description: typeof x.description === 'string' ? x.description : '',
          inviteLink: String(x.inviteLink || ''),
          category: String(x.category || ''),
          tags: Array.isArray(x.tags) ? x.tags : [],
          logoUrl: String(x.logoUrl || ''),
          createdAt: x.createdAt ? new Date(x.createdAt).toISOString() : new Date().toISOString(),
          featured: Boolean(x.featured),
          verified: Boolean(x.verified),
        }));
      // zuerst all featured nach oben, dann by createdAt desc
      const sorted = normalized.sort((a,b) => {
        if (a.featured === b.featured) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.featured ? -1 : 1;
      });
      setEntries(sorted);
    })
    .catch(err => console.error('Fehler beim Laden der Showcase-Einträge:', err));
}, []);


  // Helpers
  const validateDcsLink = (link: string) =>
    /^dcs\.lol\/[A-Za-z0-9_-]+$/.test(link);

  const addTag = (tag: string) => {
    if (
      tag &&
      !serverData.tags.includes(tag) &&
      serverData.tags.length < 5
    ) {
      setServerData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setServerData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const errs: Record<string,string> = {};
    if (!serverData.name.trim()) {
      errs.name = t('serverNameRequired');
    }
    if (!serverData.description.trim()) {
      errs.description = t('descriptionRequired');
    }
    if (!serverData.logo) {
      errs.logo = t('logoRequired');
    }
    if (
      !serverData.inviteLink.trim() ||
      !validateDcsLink(serverData.inviteLink)
    ) {
      errs.inviteLink = t('invalidDcsLink');
    }
    if (!serverData.category) {
      errs.category = t('categoryRequired');
    }
    if (serverData.tags.length > 5) {
      errs.tags = t('tagsTooMany');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // File drag/drop handlers
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
      setServerData(prev => ({ ...prev, logo: file }));
      setErrors(prev => ({ ...prev, logo: '' }));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type.startsWith('image/')) {
      setServerData(prev => ({ ...prev, logo: file }));
      setErrors(prev => ({ ...prev, logo: '' }));
    }
  };

  // Markdown renderer
  const renderMarkdown = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');

  // Form submission
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
        // json.error may be string or object
        const msg = typeof json.error === 'string'
          ? json.error
          : JSON.stringify(json.error);
        setErrors({ form: msg });
      } else {
        // success
        setEntries(prev => [json as ShowcaseEntry, ...prev]);
        setSubmitSuccess(true);
        // reset form after short delay
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
      setErrors({ form: t('uploadFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-full px-6 py-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-purple-300 font-medium">dcs.lol | Showcase</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            {t('showcaseTitle')}{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('showcaseSubtitle')}
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            {t('showcaseDescription')}
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
          >
            <Upload className="w-6 h-6" />
            <span>{t('uploadServer')}</span>
          </button>
        </div>

        {/* Entries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className="group bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 transition-transform duration-300"
              style={{
                animation: 'slideInUp 0.8s ease-out forwards',
                animationDelay: `${idx * 150}ms`
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={entry.logoUrl}
                    alt={entry.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-gray-600 transition-colors duration-300 group-hover:border-purple-400"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                      <span>{entry.name}</span>
                      {entry.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-400 inline-block ml-1" />
                      )}
                    </h3>

                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      <Users className="w-4 h-4" />
                      <span>{Array.isArray(entry.tags) ? entry.tags.length : 0} Tags</span>
                    </div>
                  </div>
                </div>
                {/* Featured badge */}
                {entry.featured && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>FEATURED</span>
                  </div>
                )}

              </div>

              {/* Description */}
              <div
                className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(entry.description)
                }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(Array.isArray(entry.tags) ? entry.tags : []).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-lg border border-purple-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(4.5) ? 'fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-gray-400 text-sm ml-2">4.5</span>
                </div>
                <a
                  href={`https://${entry.inviteLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium flex items-center space-x-2"
                >
                  <span>{t('joinServer')}</span>
                  <Link2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowUploadForm(false)}
            />
            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-8 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    {t('uploadYourServer')}
                  </h3>
                </div>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700"
                >
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>

              {/* Form */}
              <div className="p-8 max-h-[80vh] overflow-y-auto">
                {submitSuccess ? (
                  <div className="text-center py-16">
                    <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                    <h4 className="text-3xl font-bold text-white mb-4">
                      {t('uploadSuccess')}
                    </h4>
                    <p className="text-gray-300 text-lg">
                      {t('uploadSuccessDesc')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name */}
                    <div>
                      <label className="block text-white font-bold mb-2">
                        {t('serverName')} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={serverData.name}
                        onChange={e =>
                          setServerData(prev => ({
                            ...prev,
                            name: e.target.value
                          }))
                        }
                        placeholder={t('serverNamePlaceholder')}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Logo */}
                    <div>
                      <label className="block text-white font-bold mb-2">
                        {t('serverLogo')} <span className="text-red-400">*</span>
                      </label>
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition ${
                          dragActive
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-purple-500'
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
                          <div className="flex items-center justify-center space-x-4">
                            <img
                              src={URL.createObjectURL(serverData.logo)}
                              alt="Preview"
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-green-400 font-medium">
                                {serverData.logo.name}
                              </p>
                              <p className="text-gray-300 text-sm">
                                {t('logoUploaded')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-300 mb-1">
                              {t('dragDropLogo')}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {t('logoRequirements')}
                            </p>
                          </div>
                        )}
                      </div>
                      {errors.logo && (
                        <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.logo}</span>
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-white font-bold mb-2">
                        {t('serverDescription')}{' '}
                        <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={serverData.description}
                        onChange={e =>
                          setServerData(prev => ({
                            ...prev,
                            description: e.target.value
                          }))
                        }
                        placeholder={t('descriptionPlaceholder')}
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500"
                      />
                      {errors.description && (
                        <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.description}</span>
                        </p>
                      )}
                    </div>

                    {/* Invite Link */}
                    <div>
                      <label className="block text-white font-bold mb-2">
                        {t('inviteLink')} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={serverData.inviteLink}
                        onChange={e =>
                          setServerData(prev => ({
                            ...prev,
                            inviteLink: e.target.value
                          }))
                        }
                        placeholder="dcs.lol/meinserver"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500"
                      />
                      {errors.inviteLink && (
                        <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.inviteLink}</span>
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-white font-bold mb-2">
                        {t('category')} <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={serverData.category}
                        onChange={e =>
                          setServerData(prev => ({
                            ...prev,
                            category: e.target.value
                          }))
                        }
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500"
                      >
                        <option value="">
                          {t('selectCategory')}
                        </option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.category}</span>
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-white font-bold mb-2">
                        {t('tags')} <span className="text-gray-400">({t('optional')})</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {serverData.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center space-x-1 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-lg border border-purple-500/30"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-purple-400 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder={t('addTag')}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500"
                      />
                      {errors.tags && (
                        <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.tags}</span>
                        </p>
                      )}
                    </div>

                    {/* Form Error */}
                    {errors.form && (
                      <p className="text-red-400 text-center mt-2">
                        {errors.form}
                      </p>
                    )}

                    {/* Submit */}
                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Zap className="w-5 h-5 animate-spin" />
                            <span>{t('uploading')}</span>
                          </div>
                        ) : (
                          <span>{t('submitServer')}</span>
                        )}
                      </button>
                    </div>
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
