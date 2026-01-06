import React from 'react';
import {Eye, MapPin, Smartphone, TrendingUp} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';

export const Analytics: React.FC = () => {
    const {t} = useLanguage();

    const features = [
        {icon: TrendingUp, title: t('realTimeTracking'), desc: t('realTimeTrackingDesc')},
        {icon: Eye, title: t('clickAnalytics'), desc: t('clickAnalyticsDesc')},
        {icon: MapPin, title: t('geographicData'), desc: t('geographicDataDesc')},
        {icon: Smartphone, title: t('deviceAnalytics'), desc: t('deviceAnalyticsDesc')},
    ];

    const stats = [
        {label: t('totalClicks'), value: '2,547'},
        {label: t('newMembers'), value: '1,823'},
        {label: t('conversionRate'), value: '71.6%'},
        {label: t('countries'), value: '47'},
    ];

    return (
        <section id="stats" className="py-32 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
          <span
              className="inline-block px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium tracking-wide mb-8">
            Analytics
          </span>
                    <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
                        {t('analyticsTitle')}{' '}
                        <span className="italic text-primary">{t('analyticsSubtitle')}</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('analyticsDescription')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Features */}
                    <div className="space-y-8">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <feature.icon className="w-6 h-6 text-primary"/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dashboard Preview */}
                    <div className="bg-card border border-border rounded-2xl p-8">
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-foreground mb-1">{t('dashboardPreview')}</h4>
                            <p className="text-muted-foreground text-sm">{t('liveData')}</p>
                        </div>

                        <div className="space-y-4">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-4 bg-background rounded-xl border border-border"
                                >
                                    <span className="text-muted-foreground">{stat.label}</span>
                                    <span className="text-2xl font-bold text-primary">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
