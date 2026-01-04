import React from 'react';
import { ArrowRight, Sparkles, Zap, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const CTA: React.FC = () => {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main CTA */}
        <div className="mb-16">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 sm:px-6 py-3">
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400" />
              <span className="text-white font-medium text-sm sm:text-base">{t('ctaReady')}</span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              {t('ctaStart')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {t('ctaFree')}
            </span>
          </h2>

          <p className="text-lg sm:text-2xl md:text-3xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            {t('ctaJoin')} <span className="text-yellow-400 font-bold">25.000+</span> {t('ctaCommunities')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center px-4">
            <button
              onClick={scrollToTop}
              className="group bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-black text-lg sm:text-2xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-2 flex items-center space-x-3 w-full sm:w-auto justify-center"
            >
              <Zap className="w-6 sm:w-8 h-6 sm:h-8 group-hover:rotate-12 transition-transform duration-300" />
              <span>{t('ctaShortenLink')}</span>
              <ArrowRight className="w-6 sm:w-8 h-6 sm:h-8 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <div className="text-purple-200 text-base sm:text-lg text-center sm:text-left">
              <span className="block">{t('ctaNoRegistration')}</span>
              <span className="block">{t('ctaInstantAvailable')}</span>
              <span className="block">{t('ctaFreeForever')}</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 px-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-purple-400/50 transition-all duration-300 group">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('ctaFastTitle')}</h3>
            <p className="text-purple-200 text-base sm:text-lg">{t('ctaFastDesc')}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-blue-400/50 transition-all duration-300 group">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('ctaSimpleTitle')}</h3>
            <p className="text-blue-200 text-base sm:text-lg">{t('ctaSimpleDesc')}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-green-400/50 transition-all duration-300 group">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('ctaCommunityTitle')}</h3>
            <p className="text-green-200 text-base sm:text-lg">{t('ctaCommunityDesc')}</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-purple-200 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-base sm:text-lg">{t('ctaUptimeIndicator')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-base sm:text-lg">{t('ctaLinksIndicator')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-base sm:text-lg">{t('ctaCommunitiesIndicator')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};