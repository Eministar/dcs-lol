import React from 'react';
import {useAuth} from '../contexts/AuthContext';
import {Info, UserPlus} from 'lucide-react';
import {Link as RLink} from 'react-router-dom';

const Register: React.FC = () => {
    const {login} = useAuth();
    return (
        <div
            className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-6 py-12 overflow-hidden">
            {/* background orbs */}
            <div
                className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"/>
            <div
                className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"/>

            <div
                className="relative max-w-md w-full bg-gray-900/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl shadow-green-500/10 text-center">
                <div
                    className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 ring-1 ring-emerald-400/20">
                    <UserPlus className="text-white w-8 h-8"/>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Registrieren</h1>
                <p className="text-gray-300 mb-5">Erstelle zuerst einen Account mit Discord. Nur so kannst du deine
                    Kurzlinks später bearbeiten oder löschen.</p>
                <div
                    className="flex items-start gap-3 bg-amber-500/10 border border-amber-400/30 rounded-xl p-3 text-left mb-6">
                    <Info className="text-amber-400 w-5 h-5 mt-0.5"/>
                    <p className="text-amber-200 text-sm">Wichtig: Links, die du ohne Account erstellst, können später
                        nicht deinem Konto zugeordnet werden und sind nicht bearbeitbar.</p>
                </div>
                <button onClick={login}
                        className="w-full inline-flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-indigo-500/10">
                    <UserPlus className="w-5 h-5"/>
                    Mit Discord registrieren
                </button>
                <div className="mt-6 text-sm">
                    <RLink to="/login" className="text-gray-400 hover:text-gray-200">Ich habe bereits einen
                        Account</RLink>
                </div>
                <div className="mt-2 text-sm">
                    <RLink to="/" className="text-gray-400 hover:text-gray-200">Zurück zur Startseite</RLink>
                </div>
            </div>
        </div>
    );
};


export default Register;
