import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Pencil, Save, Loader2, AlertCircle } from 'lucide-react';
import { Link as RLink, useNavigate } from 'react-router-dom';

interface LinkItem {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string; // ISO
}

const Edit: React.FC = () => {
  const { user, loading, login, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<LinkItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [formSlug, setFormSlug] = useState('');

  const fetchMine = async () => {
    try {
      const res = await fetch('/api/my/links', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('Nicht eingeloggt');
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message || 'Fehler beim Laden');
    }
  };

  const triedRefresh = useRef(false);
  useEffect(() => {
    if (!loading && !user && !triedRefresh.current) {
      triedRefresh.current = true;
      // Edge case: after OAuth redirect, ensure we refetch /api/me once
      refresh().catch(() => {});
    }
  }, [loading, user, refresh]);

  useEffect(() => { if (!loading && !user) { /* show info */ } }, [loading, user]);
  useEffect(() => { if (user) fetchMine(); }, [user]);

  const startEdit = (id: string) => {
    const it = items.find(i => i.id === id);
    if (!it) return;
    setEditId(id);
    setFormUrl(it.originalUrl);
    setFormSlug('');
  };
  const cancelEdit = () => { setEditId(null); setFormUrl(''); setFormSlug(''); };

  const saveEdit = async () => {
    if (!editId) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/my/links/${encodeURIComponent(editId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ originalUrl: formUrl, newCustomId: formSlug || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Fehler beim Speichern');
      await fetchMine();
      cancelEdit();
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Speichern');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Diesen Link wirklich löschen?')) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/my/links/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Fehler beim Löschen');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Löschen');
    } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
    );
  }

  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-gray-800/70 border border-gray-700/60 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-2">Anmeldung erforderlich</h1>
          <p className="text-gray-300 mb-6">Bitte melde dich zuerst mit Discord an, um deine Server-Links zu bearbeiten.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={login} className="bg-[#5865F2] hover:bg-[#4752C4] px-6 py-3 rounded-xl font-bold">Mit Discord anmelden</button>
            <RLink to="/" className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-bold">Zurück</RLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-start justify-center px-6 py-12 overflow-hidden">
      {/* background orbs to match Login/Register */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="relative max-w-5xl w-full bg-gray-900/70 backdrop-blur-xl p-8 md:p-10 rounded-2xl border border-gray-800 shadow-2xl shadow-purple-500/10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Meine Server-Links</h1>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 rounded-full ring-2 ring-purple-500/30 overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <img
                src={user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                alt={user.username}
                className="w-full h-full object-cover block"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                }}
              />
            </div>
            <span className="text-gray-200 text-sm md:text-base">{user.username}</span>
            <button onClick={logout} className="bg-gray-800/70 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition">Logout</button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(link => (
            <div key={link.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 transition hover:border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Erstellt am {new Date(link.createdAt).toLocaleString()}</div>
              <div className="text-lg font-semibold">{window.location.origin}/{link.id}</div>
              <div className="text-gray-300 break-all">{link.originalUrl}</div>
              <div className="text-gray-400 text-sm mt-2">Klicks: <span className="font-semibold text-purple-300">{link.clicks}</span></div>

              {editId === link.id ? (
                <div className="mt-4 space-y-3">
                  <input value={formUrl} onChange={e => setFormUrl(e.target.value)} className="w-full bg-gray-950/60 border border-gray-800 focus:border-purple-600/50 outline-none rounded-xl px-3 py-2 text-sm" placeholder="Neuer Discord-Link (https://discord.gg/...)" />
                  <input value={formSlug} onChange={e => setFormSlug(e.target.value)} className="w-full bg-gray-950/60 border border-gray-800 focus:border-purple-600/50 outline-none rounded-xl px-3 py-2 text-sm" placeholder={`Neue ID (optional, z.B. ${link.id})`} />
                  <div className="flex gap-3">
                    <button onClick={saveEdit} disabled={busy} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl disabled:opacity-60"><Save className="w-4 h-4" /> Speichern</button>
                    <button onClick={cancelEdit} className="bg-gray-800/70 hover:bg-gray-700 px-4 py-2 rounded-xl">Abbrechen</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => startEdit(link.id)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"><Pencil className="w-4 h-4" /> Bearbeiten</button>
                  <button onClick={() => remove(link.id)} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"><Trash2 className="w-4 h-4" /> Löschen</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center text-gray-300 mt-16">
            Du hast noch keine Links erstellt.
            <div className="mt-3"><RLink to="/" className="text-purple-300 underline underline-offset-4">Jetzt Link erstellen</RLink></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Edit;
