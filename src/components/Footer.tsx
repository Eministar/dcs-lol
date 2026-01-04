import React, {useState} from 'react';
import {Github, Heart, Link, Mail} from 'lucide-react';
import {Privacy} from './Privacy';
import {Terms} from './TOS';
import {useLanguage} from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
    const {t} = useLanguage();
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    return (
        <>
            <footer className="bg-black border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <div
                                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <Link className="w-6 h-6 text-white"/>
                                </div>
                                <span
                                    className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  dcs.lol
                </span>
                            </div>
                            <p className="text-gray-400 mb-8 max-w-md text-lg leading-relaxed">
                                {t('footerDescription')}
                            </p>
                            <div className="flex space-x-4">
                                <a href="https://github.com/Eministar/dcs-lol"
                                   className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-purple-600 transition-all duration-300 hover:scale-110">
                                    <Github className="w-6 h-6 text-gray-300 hover:text-white"/>
                                </a>
                                <a href="mailto:hello@star-dev.xyz"
                                   className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-purple-600 transition-all duration-300 hover:scale-110">
                                    <Mail className="w-6 h-6 text-gray-300 hover:text-white"/>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-xl font-bold mb-6 text-white">{t('links')}</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#features"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        {t('features')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#about"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        {t('about')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://status.star-dev.xyz"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        {t('status')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://ko-fi.com/eministarvr"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        {t('donate')}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-xl font-bold mb-6 text-white">{t('support')}</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="https://dcs.lol/dcs"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        {t('help')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://dcs.lol/dcs"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        {t('contact')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://dcs.lol/dcs"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        {t('discord')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://dcs.lol/dcs"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        {t('feedback')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://star-dev.xyz/imprint" target="_blank" rel="noopener noreferrer"
                                       className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg">
                                        Impressum
                                    </a>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setShowPrivacy(true)}
                                        className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg"
                                    >
                                        {t('privacy')}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setShowTerms(true)}
                                        className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-lg"
                                    >
                                        {t('termsTitle')}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div
                        className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-lg">
                            © 2026 dcs.lol. {t('allRights')}
                        </p>
                        <div className="flex items-center space-x-2 text-gray-400 text-lg mt-4 md:mt-0">
                            <span>{t('madeWith')}</span>
                            <Heart className="w-5 h-5 text-red-500 fill-current"/>
                            <span>{t('forCommunities')}</span>
                        </div>
                    </div>
                </div>
            </footer>

            <Privacy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)}/>
            <Terms isOpen={showTerms} onClose={() => setShowTerms(false)}/>
        </>
    );
};