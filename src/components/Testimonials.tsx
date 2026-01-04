import React from 'react';
import { Star, MessageCircle, Users, Crown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  server: string;
  members: string;
  avatar: string;
  content: {
    de: string;
    en: string;
  };
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
  const { t, language } = useLanguage();

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            {t('testimonialsTitle')} <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{t('testimonialsSubtitle')}</span> {t('testimonialsEnd')}
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {t('testimonialsDescription')} <span className="text-green-400 font-bold">{t('testimonialsCount')}</span> {t('testimonialsDescEnd')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10"
              style={{
                animationDelay: `${index * 150}ms`,
                animation: 'slideInUp 0.8s ease-out forwards'
              }}
            >
              {/* Rating */}
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-300 text-lg leading-relaxed mb-8">
                "{testimonial.content[language as keyof typeof testimonial.content]}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    {testimonial.verified && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <MessageCircle className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-400 text-xs font-medium">{testimonial.server}</span>
                    <Users className="w-3 h-3 text-gray-500 ml-2" />
                    <span className="text-gray-500 text-xs">{testimonial.members}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-full px-8 py-4">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-green-300 font-bold text-lg">{t('starsRating')}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300">{t('reviewsCount')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};