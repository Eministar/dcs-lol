import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Link, Globe, Zap, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatItem {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  suffix?: string;
}

const CountUp: React.FC<{ end: number; duration: number; suffix?: string }> = ({ 
  end, 
  duration, 
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <span>
      {end > 100 ? formatNumber(count) : count.toFixed(1)}
      {suffix}
    </span>
  );
};

export const Stats: React.FC = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  const statsData: StatItem[] = [
    {
      icon: Link,
      value: '50000',
      label: t('linksCreated'),
      color: 'from-blue-500 to-cyan-500',
      suffix: '+'
    },
    {
      icon: Users,
      value: '25000',
      label: t('activeUsers'),
      color: 'from-green-500 to-emerald-500',
      suffix: '+'
    },
    {
      icon: TrendingUp,
      value: '1200000',
      label: t('clicksGenerated'),
      color: 'from-purple-500 to-violet-500',
      suffix: '+'
    },
    {
      icon: Globe,
      value: '150',
      label: t('countriesReached'),
      color: 'from-orange-500 to-red-500',
      suffix: '+'
    },
    {
      icon: Zap,
      value: '99.9',
      label: t('uptimePercent'),
      color: 'from-yellow-500 to-orange-500',
      suffix: '%'
    },
    {
      icon: Award,
      value: '4.9',
      label: t('rating'),
      color: 'from-pink-500 to-rose-500',
      suffix: '/5'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section id="stats-section" className="py-16 sm:py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            {t('statsTitle')} <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{t('statsSubtitle')}</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
            {t('statsDescription')} <span className="text-cyan-400 font-bold">{t('statsHighlight')}</span> {t('statsDescEnd')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="group bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10 text-center"
              style={{
                animationDelay: `${index * 150}ms`,
                animation: 'slideInUp 0.8s ease-out forwards'
              }}
            >
              <div className={`w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tabular-nums">
                {isVisible ? (
                  <CountUp 
                    end={parseFloat(stat.value)} 
                    duration={2.5} 
                    suffix={stat.suffix}
                  />
                ) : (
                  '0' + (stat.suffix || '')
                )}
              </div>
              
              <p className="text-gray-300 text-base sm:text-lg font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Achievement Badges */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-2xl border border-yellow-500/30">
            <Award className="w-10 sm:w-12 h-10 sm:h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{t('topShortener')}</h3>
            <p className="text-gray-300 text-sm sm:text-base">{t('topShortenerDesc')}</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl border border-green-500/30">
            <Zap className="w-10 sm:w-12 h-10 sm:h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{t('lightningFast')}</h3>
            <p className="text-gray-300 text-sm sm:text-base">{t('lightningFastDesc')}</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/30">
            <Globe className="w-10 sm:w-12 h-10 sm:h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{t('globallyAvailable')}</h3>
            <p className="text-gray-300 text-sm sm:text-base">{t('globallyAvailableDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};