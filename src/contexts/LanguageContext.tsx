import React, {createContext, ReactNode, useContext, useState} from "react";

interface Translations {
    [key: string]: {
        [key: string]: string;
    };
}

const translations: Translations = {
    de: {
        // Header
        features: "Features",
        about: "Über uns",
        getStarted: "Loslegen",

        // Hero
        heroTitle: "Discord Links",
        heroSubtitle: "verkürzen",
        heroDescription:
            "Verwandle deine langen Discord Server Einladungen in kurze, elegante Links.",
        heroHighlight: "Einfach. Schnell. Kostenlos.",
        fastFree: "Blitzschnell & Kostenlos",
        discordPlaceholder: "Discord Invite Link hier einfügen...",
        customPlaceholder: "Wunsch-Link (z. B. meinserver)",
        shortenButton: "Link verkürzen",
        creating: "Link wird erstellt...",
        yourLink: "Dein verkürzter Link:",
        linksShortened: "Links verkürzt",
        uptime: "Verfügbarkeit",
        free: "Kostenlos",

        // Features
        whyTitle: "Warum",
        whySubtitle: "Der beste URL-Verkürzer für Discord Communities.",
        whyHighlight: "Einfach, schnell und kostenlos.",
        fastTitle: "Blitzschnell",
        fastDesc: "Links werden in Millisekunden erstellt und weitergeleitet.",
        secureTitle: "Sicher & Zuverlässig",
        secureDesc: "Deine Links sind sicher und funktionieren immer zuverlässig.",
        easyTitle: "Einfache Nutzung",
        easyDesc: "Keine Registrierung nötig. Einfach Link einfügen und fertig.",
        mobileTitle: "Mobile Optimiert",
        mobileDesc: "Perfekte Darstellung auf allen Geräten und Bildschirmgrößen.",
        globalTitle: "Global Verfügbar",
        globalDesc: "Weltweite Verfügbarkeit mit schnellen Servern überall.",
        discordTitle: "Discord Spezialist",
        discordDesc: "Speziell für Discord Communities entwickelt und optimiert.",

        // Stats
        statsTitle: "dcs.lol in",
        statsSubtitle: "Zahlen",
        statsDescription: "Vertraue auf die Plattform, die bereits",
        statsHighlight: "hunderte Communities",
        statsDescEnd: "erfolgreich macht",
        linksCreated: "Links verkürzt",
        activeUsers: "Aktive Nutzer",
        clicksGenerated: "Klicks generiert",
        countriesReached: "Länder erreicht",
        uptimePercent: "Uptime",
        rating: "Bewertung",
        topShortener: "#1 Discord Shortener",
        topShortenerDesc: "Meistgenutzte Plattform für Discord-Links",
        lightningFast: "Blitzschnell",
        lightningFastDesc: "Durchschnittlich 50ms Antwortzeit",
        globallyAvailable: "Global verfügbar",
        globallyAvailableDesc: "CDN in mehreren Ländern",

        // Analytics
        analyticsTitle: "Leistungsstarke",
        analyticsSubtitle: "Analytics",
        analyticsDescription:
            "Erhalte detaillierte Einblicke in das Wachstum deines Discord-Servers mit umfassenden Analytics und Tracking.",
        realTimeTracking: "Echtzeit-Tracking",
        realTimeTrackingDesc:
            "Überwache Klicks, Referrer und Nutzerengagement in Echtzeit mit Live-Updates.",
        clickAnalytics: "Klick-Analytics",
        clickAnalyticsDesc:
            "Detaillierte Aufschlüsselung, wer deine Links geklickt hat und wann sie deinem Server beigetreten sind.",
        geographicData: "Geografische Daten",
        geographicDataDesc:
            "Sieh, woher deine Community-Mitglieder aus der ganzen Welt beitreten.",
        deviceAnalytics: "Geräte-Analytics",
        deviceAnalyticsDesc:
            "Verstehe, welche Geräte deine Community nutzt, um dein Server-Erlebnis zu optimieren.",
        dashboardPreview: "Analytics Dashboard Vorschau",
        liveData: "Live-Daten von deinen verkürzten Links",
        totalClicks: "Gesamte Klicks",
        newMembers: "Neue Mitglieder",
        conversionRate: "Conversion-Rate",
        countries: "Länder",

        // Testimonials
        testimonialsTitle: "Was",
        testimonialsSubtitle: "Communities",
        testimonialsEnd: "sagen",
        testimonialsDescription: "Über",
        testimonialsCount: "100+",
        testimonialsDescEnd: "Discord-Server vertrauen bereits auf dcs.lol",
        starsRating: "4.9/5 Sterne",
        reviewsCount: "Über 10+ Bewertungen",

        // FAQ
        faqTitle: "Häufig gestellte",
        faqSubtitle: "Fragen",
        faqDescription: "Alles was du über dcs.lol wissen musst",
        stillQuestions: "Noch Fragen?",
        supportTeam: "Unser Support-Team hilft dir gerne weiter!",
        discordSupport: "Discord Support",
        emailSupport: "E-Mail Support",

        // CTA
        ctaReady: "Bereit für den nächsten Level?",
        ctaStart: "Starte jetzt",
        ctaFree: "kostenlos!",
        ctaJoin: "Schließe dich",
        ctaCommunities: "Discord-Communities an, die bereits auf dcs.lol vertrauen",
        ctaShortenLink: "Link verkürzen",
        ctaNoRegistration: "✨ Keine Registrierung",
        ctaInstantAvailable: "⚡ Sofort verfügbar",
        ctaFreeForever: "🎯 100% kostenlos",
        ctaFastTitle: "Blitzschnell",
        ctaFastDesc: "Links in Millisekunden erstellt und sofort einsatzbereit",
        ctaSimpleTitle: "Einfach",
        ctaSimpleDesc:
            "Keine Registrierung, keine Limits - einfach Link einfügen und fertig",
        ctaCommunityTitle: "Community",
        ctaCommunityDesc:
            "Speziell für Discord-Communities entwickelt und optimiert",
        ctaUptimeIndicator: "99.9% Uptime",
        ctaLinksIndicator: "50+ Links erstellt",
        ctaCommunitiesIndicator: "25+ Communities",

        // Last URLs
        recentTitle: "Zuletzt",
        recentSubtitle: "erstellt",
        recentDescription:
            "Sieh dir die neuesten verkürzten Discord Links an und lass dich inspirieren.",
        original: "Original:",
        shortened: "Verkürzt:",
        clicksToday: "Klicks heute",
        showAll: "Alle Links anzeigen",

        // Showcase
        showcaseTitle: "Server",
        showcaseSubtitle: "Showcase",
        showcaseDescription:
            "Präsentiere deinen Discord-Server der Community und gewinne neue Mitglieder!",
        uploadServer: "Server hochladen",
        joinServer: "Beitreten",
        uploadYourServer: "Deinen Server hochladen",
        serverName: "Server Name",
        serverNamePlaceholder: "z.B. Epic Gaming Community",
        serverLogo: "Server Logo",
        dragDropLogo: "Logo hier hinziehen oder klicken zum Auswählen",
        logoRequirements: "PNG, JPG bis 5MB - Empfohlen: 512x512px",
        logoUploaded: "Logo erfolgreich hochgeladen",
        serverDescription: "Server Beschreibung",
        descriptionPlaceholder:
            "Beschreibe deinen Server... (Markdown unterstützt)\n\n**Fett**, *kursiv*, Listen etc.",
        markdownSupport:
            "Markdown wird unterstützt: **fett**, *kursiv*, Listen, etc.",
        inviteLink: "Einladungslink",
        onlyDcsLinks: "Nur dcs.lol Links sind erlaubt",
        category: "Kategorie",
        selectCategory: "Kategorie auswählen",
        tags: "Tags",
        optional: "optional",
        addTag: "Tag hinzufügen (Enter drücken)",
        tagInstructions: "Drücke Enter um Tags hinzuzufügen. Max. 5 Tags.",
        submitServer: "Server einreichen",
        uploading: "Wird hochgeladen...",
        uploadSuccess: "Erfolgreich eingereicht!",
        uploadSuccessDesc:
            "Dein Server wird in Kürze überprüft und freigeschaltet.",

        // Validation
        serverNameRequired: "Server Name ist erforderlich",
        descriptionRequired: "Beschreibung ist erforderlich",
        logoRequired: "Logo ist erforderlich",
        linkRequired: "Einladungslink ist erforderlich",
        invalidDcsLink: "Nur dcs.lol Links sind erlaubt (z.B. dcs.lol/meinserver)",
        categoryRequired: "Kategorie ist erforderlich",
        tagsTooMany: "Maximal 5 Tags erlaubt",
        uploadFailed: "Upload fehlgeschlagen",

        // Footer
        footerDescription:
            "Der beste Discord URL-Verkürzer. Einfach, schnell und kostenlos für alle Communities.",
        links: "Links",
        support: "Support",
        help: "Hilfe",
        contact: "Kontakt",
        discord: "Discord",
        feedback: "Feedback",
        status: "Status",
        donate: "Spenden",
        privacy: "Datenschutz",
        allRights: "Alle Rechte vorbehalten.",
        madeWith: "Gemacht mit",
        forCommunities: "für Discord Communities",

        // Privacy
        privacyTitle: "Datenschutzerklärung",
        privacyIntro:
            "nehmen wir deinen Datenschutz ernst. Diese Erklärung zeigt, wie wir mit deinen Daten umgehen.",
        dataCollection: "Welche Daten sammeln wir?",
        dataUsage: "Wie verwenden wir deine Daten?",
        dataProtection: "Wie schützen wir deine Daten?",
        dataSharing: "Teilen wir deine Daten?",
        yourRights: "Deine Rechte (DSGVO)",
        privacyContact: "Fragen zum Datenschutz?",
        lastUpdated: "Letzte Aktualisierung: 10. Juni 2025",

        termsTitle: "Nutzungsbedingungen",
        termsLastUpdated: "Letzte Aktualisierung: 12. Juni 2025",
        termsIntro:
            "Bitte lese diese Nutzungsbedingungen sorgfältig durch, bevor du unseren Service nutzt.",
        terms1:
            "Zustimmung: Durch die Nutzung von dcs.lol erklärst du dich mit diesen Bedingungen einverstanden.",
        terms2:
            "Service: Wir bieten dir einen Discord-Linkverkürzer an, wie in der Leistungsbeschreibung dargestellt.",
        terms3:
            "Nutzerpflichten: Du darfst unsere Links nicht für rechtswidrige oder beleidigende Inhalte verwenden.",
        terms4:
            "Geistiges Eigentum: Alle Markenzeichen und Inhalte bleiben Eigentum ihrer Inhaber.",
        terms5:
            "Haftungsausschluss: Wir übernehmen keine Haftung für Folgeschäden durch die Nutzung unserer Links.",
        terms6:
            "Änderungen: Wir können diese Bedingungen jederzeit anpassen; Änderungen werden hier veröffentlicht.",
        terms7:
            "Beendigung: Wir behalten uns das Recht vor, deinen Zugang bei Verstößen zu sperren.",
        terms8:
            "Anwendbares Recht: Es gilt deutsches Recht. Gerichtsstand ist Berlin.",
        terms9: "Kontakt: Bei Fragen erreichst du uns unter info@dcs.lol.",
        terms10:
            "Reservierte Routen: Bestimmte Pfade wie /support, /about, /terms oder ähnliche sind fest für dcs.lol reserviert und dürfen nicht von Nutzern als Kurzlinks erstellt werden, da dies zu Verwirrung oder Missbrauch führen kann. Sollten solche Links dennoch erstellt werden, behalten wir uns das Recht vor, diese ohne Vorankündigung zu entfernen, dem entsprechenden Account zu entziehen oder die Weiterleitung auf offizielle dcs.lol-Discord-Server umzuleiten.",
        terms11:
            "Missbrauch: Wiederholter oder vorsätzlicher Missbrauch reservierter Routen kann zur temporären oder dauerhaften Sperrung des Nutzerkontos führen.",


        // Redirect Page
        redirectLoading: "Server wird geladen...",
        redirectPreparing: "Bereite Discord-Einladung vor",
        redirectNotFound: "Server nicht gefunden",
        redirectNotFoundDesc:
            "Dieser Discord-Server existiert nicht oder ist nicht verfügbar.",
        redirectBackHome: "Zurück zu dcs.lol",
        redirectCountdown: "Weiterleitung in",
        redirectSeconds: "Sekunden...",
        redirectJoinNow: "Jetzt beitreten",
        redirectManualJoin: "Manuell beitreten",
        redirectPoweredBy: "Powered by",
        redirectBestShortener: "Der beste Discord URL-Verkürzer",
        redirectCreateLinks:
            "Erstelle stylische Kurzlinks für deinen Discord-Server.",
        redirectFreeForever: "Kostenlos, schnell und für immer!",
        redirectStartFree: "Jetzt kostenlos starten",
        redirectFastFeature: "Blitzschnell",
        redirectFastDesc: "Links in Millisekunden erstellt",
        redirectSecureFeature: "Sicher",
        redirectSecureDesc: "99.9% Uptime garantiert",
        redirectAnalyticsFeature: "Analytics",
        redirectAnalyticsDesc: "Detaillierte Statistiken",
        redirectLinksCreated: "50.000+ Links",
        redirectCommunities: "25.000+ Communities",
        redirectRating: "4.9 / 5 Sterne",

        // Errors
        enterUrl: "Bitte gib eine Discord Invite URL ein",
        invalidUrl:
            "Bitte gib eine gültige Discord Invite URL ein (discord.gg/... oder discord.com/invite/...)",
        enterCustom: "Bitte gib einen Wunsch-Link ein",
    },
    en: {
        // Header
        features: "Features",
        about: "About",
        getStarted: "Get Started",

        // Hero
        heroTitle: "Shorten Discord",
        heroSubtitle: "Links",
        heroDescription:
            "Transform your long Discord server invitations into short, elegant links.",
        heroHighlight: "Simple. Fast. Free.",
        fastFree: "Lightning Fast & Free",
        discordPlaceholder: "Paste Discord invite link here...",
        customPlaceholder: "Custom link (e.g. myserver)",
        shortenButton: "Shorten Link",
        creating: "Creating link...",
        yourLink: "Your shortened link:",
        linksShortened: "Links shortened",
        uptime: "Uptime",
        free: "Free",

        // Features
        whyTitle: "Why",
        whySubtitle: "The best URL shortener for Discord communities.",
        whyHighlight: "Simple, fast and free.",
        fastTitle: "Lightning Fast",
        fastDesc: "Links are created and redirected in milliseconds.",
        secureTitle: "Secure & Reliable",
        secureDesc: "Your links are safe and always work reliably.",
        easyTitle: "Easy to Use",
        easyDesc: "No registration required. Just paste link and go.",
        mobileTitle: "Mobile Optimized",
        mobileDesc: "Perfect display on all devices and screen sizes.",
        globalTitle: "Globally Available",
        globalDesc: "Worldwide availability with fast servers everywhere.",
        discordTitle: "Discord Specialist",
        discordDesc: "Specially developed and optimized for Discord communities.",

        // Stats
        statsTitle: "dcs.lol in",
        statsSubtitle: "Numbers",
        statsDescription: "Trust the platform that already makes",
        statsHighlight: "hundreds of communities",
        statsDescEnd: "successful",
        linksCreated: "Links shortened",
        activeUsers: "Active users",
        clicksGenerated: "Clicks generated",
        countriesReached: "Countries reached",
        uptimePercent: "Uptime",
        rating: "Rating",
        topShortener: "#1 Discord Shortener",
        topShortenerDesc: "Most used platform for Discord links",
        lightningFast: "Lightning Fast",
        lightningFastDesc: "Average 50ms response time",
        globallyAvailable: "Globally Available",
        globallyAvailableDesc: "CDN in lots of countries",

        // Analytics
        analyticsTitle: "Powerful",
        analyticsSubtitle: "Analytics",
        analyticsDescription:
            "Get detailed insights into your Discord server growth with comprehensive analytics and tracking.",
        realTimeTracking: "Real-time Tracking",
        realTimeTrackingDesc:
            "Monitor clicks, referrers, and user engagement in real-time with live updates.",
        clickAnalytics: "Click Analytics",
        clickAnalyticsDesc:
            "Detailed breakdown of who clicked your links and when they joined your server.",
        geographicData: "Geographic Data",
        geographicDataDesc:
            "See where your community members are joining from around the world.",
        deviceAnalytics: "Device Analytics",
        deviceAnalyticsDesc:
            "Understand what devices your community uses to optimize your server experience.",
        dashboardPreview: "Analytics Dashboard Preview",
        liveData: "Live data from your shortened links",
        totalClicks: "Total Clicks",
        newMembers: "New Members",
        conversionRate: "Conversion Rate",
        countries: "Countries",

        // Testimonials
        testimonialsTitle: "What",
        testimonialsSubtitle: "Communities",
        testimonialsEnd: "Say",
        testimonialsDescription: "Over",
        testimonialsCount: "100+",
        testimonialsDescEnd: "Discord servers already trust dcs.lol",
        starsRating: "4.9/5 Stars",
        reviewsCount: "Over 10+ Reviews",

        // FAQ
        faqTitle: "Frequently Asked",
        faqSubtitle: "Questions",
        faqDescription: "Everything you need to know about dcs.lol",
        stillQuestions: "Still have questions?",
        supportTeam: "Our support team is happy to help!",
        discordSupport: "Discord Support",
        emailSupport: "Email Support",

        // CTA
        ctaReady: "Ready for the next level?",
        ctaStart: "Start now",
        ctaFree: "for free!",
        ctaJoin: "Join",
        ctaCommunities: "Discord communities that already trust dcs.lol",
        ctaShortenLink: "Shorten Link",
        ctaNoRegistration: "✨ No registration",
        ctaInstantAvailable: "⚡ Instantly available",
        ctaFreeForever: "🎯 100% free",
        ctaFastTitle: "Lightning Fast",
        ctaFastDesc: "Links created in milliseconds and instantly ready",
        ctaSimpleTitle: "Simple",
        ctaSimpleDesc: "No registration, no limits - just paste link and go",
        ctaCommunityTitle: "Community",
        ctaCommunityDesc:
            "Specially developed and optimized for Discord communities",
        ctaUptimeIndicator: "99.9% Uptime",
        ctaLinksIndicator: "50+ Links created",
        ctaCommunitiesIndicator: "25+ Communities",

        // Last URLs
        recentTitle: "Recently",
        recentSubtitle: "created",
        recentDescription:
            "Check out the latest shortened Discord links and get inspired.",
        original: "Original:",
        shortened: "Shortened:",
        clicksToday: "Clicks today",
        showAll: "Show all links",

        // Showcase
        showcaseTitle: "Server",
        showcaseSubtitle: "Showcase",
        showcaseDescription:
            "Present your Discord server to the community and gain new members!",
        uploadServer: "Upload Server",
        joinServer: "Join",
        uploadYourServer: "Upload Your Server",
        serverName: "Server Name",
        serverNamePlaceholder: "e.g. Epic Gaming Community",
        serverLogo: "Server Logo",
        dragDropLogo: "Drag & drop logo here or click to select",
        logoRequirements: "PNG, JPG up to 5MB - Recommended: 512x512px",
        logoUploaded: "Logo uploaded successfully",
        serverDescription: "Server Description",
        descriptionPlaceholder:
            "Describe your server... (Markdown supported)\n\n**Bold**, *italic*, lists etc.",
        markdownSupport: "Markdown is supported: **bold**, *italic*, lists, etc.",
        inviteLink: "Invite Link",
        onlyDcsLinks: "Only dcs.lol links are allowed",
        category: "Category",
        selectCategory: "Select category",
        tags: "Tags",
        optional: "optional",
        addTag: "Add tag (press Enter)",
        tagInstructions: "Press Enter to add tags. Max. 5 tags.",
        submitServer: "Submit Server",
        uploading: "Uploading...",
        uploadSuccess: "Successfully submitted!",
        uploadSuccessDesc: "Your server will be reviewed and approved shortly.",

        // Validation
        serverNameRequired: "Server name is required",
        descriptionRequired: "Description is required",
        logoRequired: "Logo is required",
        linkRequired: "Invite link is required",
        invalidDcsLink: "Only dcs.lol links are allowed (e.g. dcs.lol/myserver)",
        categoryRequired: "Category is required",
        tagsTooMany: "Maximum 5 tags allowed",
        uploadFailed: "Upload failed",

        // Footer
        footerDescription:
            "The best Discord URL shortener. Simple, fast and free for all communities.",
        links: "Links",
        support: "Support",
        help: "Help",
        contact: "Contact",
        discord: "Discord",
        feedback: "Feedback",
        status: "Status",
        donate: "Donate",
        privacy: "Privacy",
        allRights: "All rights reserved.",
        madeWith: "Made with",
        forCommunities: "for Discord communities",

        // Privacy
        privacyTitle: "Privacy Policy",
        privacyIntro:
            "we take your privacy seriously. This policy explains how we handle your data.",
        dataCollection: "What data do we collect?",
        dataUsage: "How do we use your data?",
        dataProtection: "How do we protect your data?",
        dataSharing: "Do we share your data?",
        yourRights: "Your Rights (GDPR)",
        privacyContact: "Privacy questions?",
        lastUpdated: "Last updated: 10. June, 2025",

        termsTitle: "Terms of Service",
        termsLastUpdated: "Last updated: June 12, 2025",
        termsIntro:
            "Please read these Terms of Service carefully before using our service.",
        terms1: "Acceptance: By using dcs.lol, you agree to these terms.",
        terms2:
            "Service: We provide a Discord link shortening service as described.",
        terms3:
            "User Obligations: You must not use our links for unlawful or offensive content.",
        terms4:
            "Intellectual Property: All trademarks and content remain the property of their owners.",
        terms5:
            "Disclaimer: We are not liable for any indirect damages arising from use of our links.",
        terms6:
            "Amendments: We may modify these terms at any time; changes will be published here.",
        terms7:
            "Termination: We reserve the right to suspend your access for violations.",
        terms8:
            "Governing Law: German law applies. Jurisdiction is Berlin, Germany.",
        terms9: "Contact: For questions, reach us at info@dcs.lol.",

        // Redirect Page
        redirectLoading: "Loading server...",
        redirectPreparing: "Preparing Discord invitation",
        redirectNotFound: "Server not found",
        redirectNotFoundDesc:
            "This Discord server does not exist or is not available.",
        redirectBackHome: "Back to dcs.lol",
        redirectCountdown: "Redirecting in",
        redirectSeconds: "seconds...",
        redirectJoinNow: "Join now",
        redirectManualJoin: "Join manually",
        redirectPoweredBy: "Powered by",
        redirectBestShortener: "The best Discord URL shortener",
        redirectCreateLinks: "Create stylish short links for your Discord server.",
        redirectFreeForever: "Free, fast and forever!",
        redirectStartFree: "Start for free now",
        redirectFastFeature: "Lightning Fast",
        redirectFastDesc: "Links created in milliseconds",
        redirectSecureFeature: "Secure",
        redirectSecureDesc: "99.9% uptime guaranteed",
        redirectAnalyticsFeature: "Analytics",
        redirectAnalyticsDesc: "Detailed statistics",
        redirectLinksCreated: "50,000+ Links",
        redirectCommunities: "25,000+ Communities",
        redirectRating: "4.9 / 5 Stars",

        // Errors
        enterUrl: "Please enter a Discord invite URL",
        invalidUrl:
            "Please enter a valid Discord invite URL (discord.gg/... or discord.com/invite/...)",
        enterCustom: "Please enter a custom link",
    },
};

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
                                                                        children,
                                                                    }) => {
    const [language, setLanguage] = useState("de");

    const t = (key: string): string => {
        return translations[language]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{language, setLanguage, t}}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
