import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Shield, AlertCircle } from 'lucide-react';
import { Link as RLink, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const location = useLocation();
  const initialError = useMemo(() => new URLSearchParams(location.search).get('error') || '', [location.search]);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (initialError) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState(null, '', url.toString());
    }
  }, [initialError]);

  const errorText = useMemo(() => {
    if (!error) return '';
    switch (error) {
      case 'oauth_missing_code':
        return 'Discord hat keinen Code zurückgegeben. Bitte versuche es erneut.';
      case 'oauth_state':
        return 'Sicherheitsüberprüfung fehlgeschlagen (State). Bitte erneut anmelden.';
      case 'oauth_access_denied':
        return 'Du hast den Zugriff abgelehnt. Bitte erlaube den Zugriff, um fortzufahren.';
      case 'oauth_interaction_required':
        return 'Interaktion erforderlich. Bitte stimme im Discord-Fenster zu und versuche es erneut.';
      case 'oauth_not_configured':
        return 'Discord OAuth ist derzeit nicht richtig konfiguriert.';
      case 'oauth_token':
        return 'Token-Austausch mit Discord fehlgeschlagen. Bitte später erneut versuchen.';
      case 'oauth_user':
        return 'Benutzerinformationen konnten nicht geladen werden.';
      case 'login_failed':
        return 'Login fehlgeschlagen. Bitte später erneut versuchen.';
      default:
        return 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.';
    }
  }, [error]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* background orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="relative max-w-md w-full bg-gray-900/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl shadow-purple-500/10">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-6 ring-1 ring-purple-400/20">
          <Shield className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Anmelden</h1>
        <p className="text-gray-300 mb-6">Melde dich mit Discord an, um deine Server‑Links zu verwalten.</p>

        {errorText && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">{errorText}</div>
            <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-red-100 text-xs">Schließen</button>
          </div>
        )}

        <button onClick={login} className="w-full inline-flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-indigo-500/10">
          <LogIn className="w-5 h-5" />
          Mit Discord anmelden
        </button>
        <p className="text-gray-400 text-xs mt-6">Mit der Anmeldung erklärst du dich mit unseren Nutzungsbedingungen einverstanden.</p>
        <div className="mt-6 text-sm text-gray-400">
          Noch kein Account? <RLink to="/register" className="text-purple-300 hover:text-purple-200 underline underline-offset-4">Jetzt registrieren</RLink>
        </div>
        <div className="mt-2 text-sm">
          <RLink to="/" className="text-gray-400 hover:text-gray-200">Zurück zur Startseite</RLink>
        </div>
      </div>
    </div>
  );
};

export default Login;
