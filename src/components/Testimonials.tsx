import React from 'react';
import {Crown, MessageCircle, Star, Users} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    server: string;
    members: string;
    avatar: string;
    content: { de: string; en: string };
    rating: number;
    verified: boolean;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Alex Gaming",
        role: "Server Owner",
        server: "Epic Gamers Hub",
        members: "15.2K",
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        content: {
            de: "dcs.lol hat unsere Discord-Einladungen revolutioniert! Die kurzen Links sehen professionell aus und die Analytics helfen uns, unser Wachstum zu verstehen.",
            en: "dcs.lol has revolutionized our Discord invitations! The short links look professional and the analytics help us understand our growth."
        },
        rating: 5,
        verified: true
    },
    {
        id: 2,
        name: "Sarah Dev",
        role: "Community Manager",
        server: "Code Masters",
        members: "8.7K",
        avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        content: {
            de: "Endlich ein URL-Shortener, der speziell für Discord gemacht ist! Die Geschwindigkeit ist unglaublich und die benutzerdefinierten Links sind perfekt für unser Branding.",
            en: "Finally a URL shortener made specifically for Discord! The speed is incredible and the custom links are perfect for our branding."
        },
        rating: 5,
        verified: true
    },
    {
        id: 3,
        name: "Mike Stream",
        role: "Content Creator",
        server: "Stream Community",
        members: "23.1K",
        avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        content: {
            de: "Als Streamer teile ich ständig meinen Discord-Link. dcs.lol macht es so einfach und die Links sind viel einfacher zu merken!",
            en: "As a streamer, I constantly share my Discord link. dcs.lol makes it so easy and the links are much easier to remember!"
        },
        rating: 5,
        verified: true
    },
    {
        id: 4,
        name: "Lisa Art",
        role: "Artist",
        server: "Creative Minds",
        members: "5.3K",
        avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        content: {
            de: "Die Benutzeroberfläche ist wunderschön und so einfach zu bedienen. Perfekt für unsere Künstler-Community!",
            en: "The user interface is beautiful and so easy to use. Perfect for our artist community!"
        },
        rating: 5,
        verified: false
    },
    {
        id: 5,
        name: "Tom Tech",
        role: "Developer",
        server: "Tech Innovators",
        members: "12.8K",
        avatar: "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        content: {
            de: "Schnell, zuverlässig und kostenlos. Was will man mehr? Die Analytics sind ein echter Bonus!",
            en: "Fast, reliable and free. What more could you want? The analytics are a real bonus!"
        },
        rating: 5,
        verified: true
    },
    {
        id: 6,
        name: "Emma Music",
        role: "DJ",
        server: "Beat Drops",
        members: "9.4K",
        avatar: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        content: {
            de: "Unsere Events werden jetzt viel besser besucht, seit wir dcs.lol verwenden. Die Links sind einfach zu teilen!",
            en: "Our events are now much better attended since we started using dcs.lol. The links are so easy to share!"
        },
        rating: 5,
        verified: false
    }
];

export const Testimonials: React.FC = () => {
    const {t, language} = useLanguage();

    return (
        <section className="py-32 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
          <span
              className="inline-block px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium tracking-wide mb-8">
            Testimonials
          </span>
                    <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
                        {t('testimonialsTitle')}{' '}
                        <span className="italic text-primary">{t('testimonialsSubtitle')}</span>{' '}
                        {t('testimonialsEnd')}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('testimonialsDescription')}{' '}
                        <span className="text-primary font-medium">{t('testimonialsCount')}</span>{' '}
                        {t('testimonialsDescEnd')}
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <article
                            key={testimonial.id}
                            className="group bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
                            style={{animationDelay: `${index * 100}ms`}}
                        >
                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-primary fill-primary"/>
                                ))}
                            </div>

                            {/* Content */}
                            <blockquote className="text-foreground/80 leading-relaxed mb-8">
                                "{testimonial.content[language as keyof typeof testimonial.content]}"
                            </blockquote>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover border border-border"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-foreground font-semibold">{testimonial.name}</h4>
                                        {testimonial.verified && (
                                            <Crown className="w-4 h-4 text-primary"/>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="flex items-center gap-1 text-primary">
                      <MessageCircle className="w-3 h-3"/>
                        {testimonial.server}
                    </span>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3"/>
                                            {testimonial.members}
                    </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* CTA Badge */}
                <div className="text-center mt-16">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-full">
                        <Star className="w-5 h-5 text-primary fill-primary"/>
                        <span className="text-foreground font-semibold">{t('starsRating')}</span>
                        <span className="text-border">•</span>
                        <span className="text-muted-foreground">{t('reviewsCount')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
