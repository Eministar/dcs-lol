import React, {useCallback, useEffect, useState} from 'react';
import {Crown, Eye, Heart, Medal, Star, TrendingUp, Trophy} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';

interface TopServer {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    inviteLink: string;
    category: string;
    avgRating: number;
    ratingCount: number;
    views: number;
    favoriteCount: number;
    featured: boolean;
    verified: boolean;
}

export const Leaderboard: React.FC = () => {
    const {language} = useLanguage();
    const isDE = language === 'de';
    const [topServers, setTopServers] = useState<TopServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rating' | 'views' | 'favorites'>('rating');

    const fetchTopServers = useCallback(async () => {
        setLoading(true);
        try {
            const sortParam = activeTab === 'rating' ? 'rating' : activeTab === 'views' ? 'views' : 'favorites';
            const res = await fetch(`/api/search?sort=${sortParam}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setTopServers(data.servers || []);
            }
        } catch (err) {
            console.error('Failed to fetch top servers:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchTopServers();
    }, [fetchTopServers]);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Crown className="w-6 h-6 text-yellow-400"/>;
            case 1:
                return <Medal className="w-6 h-6 text-gray-400"/>;
            case 2:
                return <Medal className="w-6 h-6 text-amber-600"/>;
            default:
                return <span
                    className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{index + 1}</span>;
        }
    };

    const tabs = [
        {id: 'rating' as const, label: isDE ? 'Beste Bewertung' : 'Top Rated', icon: Star},
        {id: 'views' as const, label: isDE ? 'Meist angesehen' : 'Most Viewed', icon: Eye},
        {id: 'favorites' as const, label: isDE ? 'Beliebteste' : 'Most Popular', icon: Heart},
    ];

    return (
        <section className="py-24 relative overflow-hidden" style={{backgroundColor: '#0b1120'}}>
            <div className="absolute inset-0 opacity-[0.03] bg-grid-soft"/>

            <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <span
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium tracking-wide mb-8">
                        <Trophy className="w-4 h-4"/>
                        Leaderboard
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                        {isDE ? 'Top' : 'Top'}{' '}
                        <span className="italic text-primary">Discord Server</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {isDE
                            ? 'Entdecke die besten und beliebtesten Discord Server der Community.'
                            : 'Discover the best and most popular Discord servers in the community.'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-10">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                    : 'bg-card text-muted-foreground hover:bg-accent border border-border'
                            }`}
                        >
                            <tab.icon className="w-4 h-4"/>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Leaderboard List */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div
                                className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"/>
                            <p className="text-muted-foreground">{isDE ? 'Lade Server...' : 'Loading servers...'}</p>
                        </div>
                    ) : topServers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                            <p className="text-muted-foreground">{isDE ? 'Noch keine Server vorhanden' : 'No servers yet'}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {topServers.map((server, index) => (
                                <div
                                    key={server.id}
                                    className={`flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors ${
                                        index === 0 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                                    }`}
                                >
                                    {/* Rank */}
                                    <div className="flex-shrink-0 w-10 flex justify-center">
                                        {getRankIcon(index)}
                                    </div>

                                    {/* Logo */}
                                    <img
                                        src={server.logoUrl}
                                        alt={server.name}
                                        className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
                                    />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground truncate flex items-center gap-2">
                                            {server.name}
                                            {server.verified && (
                                                <span
                                                    className="inline-flex items-center justify-center w-4 h-4 bg-primary/20 rounded-full">
                                                    <TrendingUp className="w-2.5 h-2.5 text-primary"/>
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-muted-foreground truncate">{server.category}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden sm:flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Star className="w-4 h-4 text-primary"/>
                                            <span>{server.avgRating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Eye className="w-4 h-4"/>
                                            <span>{server.views || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Heart className="w-4 h-4"/>
                                            <span>{server.favoriteCount || 0}</span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <a
                                        href={`https://${server.inviteLink}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg text-sm font-medium transition-all"
                                    >
                                        {isDE ? 'Beitreten' : 'Join'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
