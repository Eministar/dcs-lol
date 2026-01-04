import React, { useState } from 'react';
import { Link, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Link as RLink } from 'react-router-dom';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, login, logout } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Link className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              dcs.lol
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
            >
              {t('features')}
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium"
            >
              {t('about')}
            </button>
            <LanguageSwitcher />
            {user ? (
              <>
                <RLink to="/edit" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium">Meine Links</RLink>
                <button onClick={logout} className="text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium">Logout</button>
                <img
                  src={user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={user.username}
                  title={user.username}
                  className="w-8 h-8 rounded-full ring-2 ring-purple-500/40 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                />
              </>
            ) : (
              <>
                <RLink to="/login" className="px-4 py-2 rounded-full border border-gray-700/70 text-gray-200 hover:text-white hover:border-purple-500/50 hover:bg-gray-800/60 transition-all duration-200 font-medium">Login</RLink>
                <RLink to="/register" className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/30">Registrieren</RLink>
                <button 
                  onClick={scrollToTop}
                  className="px-5 py-2 rounded-full border border-gray-700/70 text-gray-200 hover:text-white hover:border-purple-500/50 hover:bg-gray-800/60 transition-all duration-200 font-medium"
                >
                  {t('getStarted')}
                </button>
              </>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-2xl">
            <nav className="px-4 py-6 space-y-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50"
              >
                {t('features')}
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50"
              >
                {t('about')}
              </button>
              {user ? (
                <>
                  <RLink to="/edit" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50">Meine Links</RLink>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50">Logout</button>
                </>
              ) : (
                <>
                  <RLink to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50">Login</RLink>
                  <RLink to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50">Registrieren</RLink>
                </>
              )}
              <button 
                onClick={scrollToTop}
                className="block w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg text-center"
              >
                {t('getStarted')}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};