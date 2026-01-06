import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";

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
            "Anwendbares Recht: Es gilt deutsches Recht. Gerichtsstand ist Karlsruhe.",
        terms9: "Kontakt: Bei Fragen erreichst du uns unter hello@star-dev.xyz.",
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
        "common.back": "Zurück",

        // --- Public pages: Terms of Service (/tos) ---
        "tos.title": "Nutzungsbedingungen (Terms of Service)",
        "tos.intro": "Diese Nutzungsbedingungen regeln die Nutzung von dcs.lol. Mit der Nutzung des Services erklärst du dich mit diesen Bedingungen einverstanden.",
        "tos.lastUpdated": "Zuletzt aktualisiert: Januar 2026",

        "tos.section1.title": "1. Geltungsbereich & Service",
        "tos.section1.item1": "dcs.lol verkürzt Discord-Invite-Links und leitet sie weiter.",
        "tos.section1.item2": "Der Service kann sich technisch und inhaltlich weiterentwickeln (z. B. neue Features, Sicherheitsmaßnahmen).",

        "tos.section2.title": "2. Erlaubte Nutzung",
        "tos.section2.item1": "Du nutzt dcs.lol nur für rechtmäßige Zwecke und im Einklang mit geltendem Recht.",
        "tos.section2.item2": "Du darfst keine Inhalte verlinken, die Rechte Dritter verletzen oder gegen Plattformregeln verstoßen.",

        "tos.section3.title": "3. Verbotene Nutzung (Missbrauch)",
        "tos.section3.item1": "Spam, Phishing, Malware, Betrug (Scams) oder irreführende Weiterleitungen sind strikt verboten.",
        "tos.section3.item2": "Automatisierte Massenanfragen (Bots), die den Service beeinträchtigen, sind untersagt.",
        "tos.section3.item3": "Das Umgehen von Sicherheitsmechanismen oder Rate-Limits ist verboten.",

        "tos.section4.title": "4. Inhalte, Verantwortung & Moderation",
        "tos.section4.item1": "Du bist für die von dir erstellten Links und deren Zielinhalte verantwortlich.",
        "tos.section4.item2": "Wir können Links sperren oder entfernen, wenn Missbrauch vermutet wird oder eine rechtliche Verpflichtung besteht.",
        "tos.section4.item3": "Bestimmte Pfade (z. B. /tos, /privacy, /login) können reserviert sein und dürfen nicht als Kurz-ID verwendet werden.",

        "tos.section5.title": "5. Verfügbarkeit & Haftung",
        "tos.section5.item1": "Der Service wird ohne Gewähr bereitgestellt; Ausfälle oder Unterbrechungen können nicht ausgeschlossen werden.",
        "tos.section5.item2": "Soweit gesetzlich zulässig, haften wir nicht für indirekte Schäden oder Folgeschäden aus der Nutzung.",

        "tos.section6.title": "6. Änderungen",
        "tos.section6.item1": "Wir können diese Bedingungen anpassen. Die aktuelle Version ist jederzeit unter /tos verfügbar.",

        "tos.section7.title": "7. Reservierte Routen",
        "tos.section7.item1": "Bestimmte Pfade (z. B. /support, /about, /terms, /tos, /privacy, /login) sind für dcs.lol reserviert und dürfen nicht als Kurz-ID verwendet werden.",
        "tos.section7.item2": "Wenn solche Kurzlinks erstellt wurden, können wir sie ohne Vorankündigung entfernen oder umleiten, um Missbrauch/Verwirrung zu vermeiden.",

        "tos.section8.title": "8. Durchsetzung & Sperrung",
        "tos.section8.item1": "Wiederholter oder vorsätzlicher Missbrauch kann zu einer temporären oder dauerhaften Sperrung führen.",

        "tos.section9.title": "9. Kontakt",
        "tos.section9.item1": "Bei Fragen erreichst du uns unter hello@star-dev.xyz.",

        // --- Public pages: Privacy Policy (/privacy) ---
        "privacyPage.title": "Datenschutzerklärung",
        "privacyPage.intro": "Wir nehmen Datenschutz ernst. Diese Erklärung beschreibt, welche Daten im Rahmen der Nutzung von dcs.lol verarbeitet werden und wofür.",
        "privacyPage.lastUpdated": "Zuletzt aktualisiert: Januar 2026",

        "privacyPage.section1.title": "1. Welche Daten können anfallen?",
        "privacyPage.section1.item1": "Ursprünglicher Discord-Invite-Link, den du verkürzen möchtest.",
        "privacyPage.section1.item2": "Technische Metadaten (z. B. Browser/Device) zur Darstellung und Fehleranalyse.",
        "privacyPage.section1.item3": "IP-Adresse zur Missbrauchsprävention (sofern technisch erforderlich, ggf. gekürzt/anonymisiert).",
        "privacyPage.section1.item4": "Anonyme oder aggregierte Klick-Statistiken (z. B. Anzahl Aufrufe).",

        "privacyPage.section2.title": "2. Wofür nutzen wir diese Daten?",
        "privacyPage.section2.item1": "Bereitstellung des Services (Shortlink erstellen und weiterleiten).",
        "privacyPage.section2.item2": "Sicherheit und Missbrauchserkennung (Spam, Scams, automatisierte Angriffe).",
        "privacyPage.section2.item3": "Stabilität und Qualitätsverbesserung (Fehlerdiagnose, Performance).",

        "privacyPage.section3.title": "3. Weitergabe an Dritte",
        "privacyPage.section3.item1": "Grundsätzlich verkaufen oder vermieten wir keine personenbezogenen Daten.",
        "privacyPage.section3.item2": "Ausnahmen bestehen bei gesetzlichen Verpflichtungen oder zur Abwehr von Missbrauch/Sicherheitsvorfällen.",
        "privacyPage.section3.item3": "Technische Dienstleister (z. B. Hosting/CDN) können im Rahmen des Betriebs Zugriff auf notwendige technische Daten haben.",

        "privacyPage.section4.title": "4. Deine Rechte",
        "privacyPage.section4.item1": "Du hast Rechte auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung (soweit anwendbar).",
        "privacyPage.section4.item2": "Du kannst der Verarbeitung widersprechen, sofern gesetzliche Voraussetzungen vorliegen.",

        "privacyPage.contactTitle": "Kontakt",
        "privacyPage.contactText": "Bei Fragen zum Datenschutz erreichst du uns unter:",

        // ...existing code...
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
        terms9: "Contact: For questions, reach us at hello@star-dev.xyz.",
        terms10:
            "Reserved routes: Certain paths like /support, /about, /terms, /tos, /privacy, /login are reserved for dcs.lol and must not be used as short IDs. If such short links are created, we may remove or redirect them without notice to prevent confusion or abuse.",
        terms11:
            "Enforcement & suspension: Repeated or intentional abuse may result in temporary or permanent suspension.",

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
        "common.back": "Back",

        // --- Public pages: Terms of Service (/tos) ---
        "tos.title": "Terms of Service",
        "tos.intro": "These Terms of Service govern the use of dcs.lol. By using the service, you agree to these terms.",
        "tos.lastUpdated": "Last updated: January 2026",

        "tos.section1.title": "1. Scope & Service",
        "tos.section1.item1": "dcs.lol shortens Discord invite links and redirects them.",
        "tos.section1.item2": "The service may evolve over time (e.g., new features and security measures).",

        "tos.section2.title": "2. Acceptable use",
        "tos.section2.item1": "You may only use dcs.lol for lawful purposes and in compliance with applicable laws.",
        "tos.section2.item2": "You must not link to content that violates third-party rights or platform rules.",

        "tos.section3.title": "3. Prohibited use (abuse)",
        "tos.section3.item1": "Spam, phishing, malware, scams, or misleading redirects are strictly prohibited.",
        "tos.section3.item2": "Automated bulk requests (bots) that degrade the service are not allowed.",
        "tos.section3.item3": "Bypassing security mechanisms or rate limits is prohibited.",

        "tos.section4.title": "4. Content, responsibility & moderation",
        "tos.section4.item1": "You are responsible for the links you create and their destination content.",
        "tos.section4.item2": "We may block or remove links if abuse is suspected or we are legally required to do so.",
        "tos.section4.item3": "Certain paths (e.g., /tos, /privacy, /login) may be reserved and must not be used as short IDs.",

        "tos.section5.title": "5. Availability & liability",
        "tos.section5.item1": "The service is provided \"as is\" without warranties; downtime or interruptions may occur.",
        "tos.section5.item2": "To the extent permitted by law, we are not liable for indirect or consequential damages.",

        "tos.section6.title": "6. Changes",
        "tos.section6.item1": "We may update these terms. The current version is always available at /tos.",

        "tos.section7.title": "7. Reserved routes",
        "tos.section7.item1": "Certain paths (e.g., /support, /about, /terms, /tos, /privacy, /login) are reserved for dcs.lol and must not be used as short IDs.",
        "tos.section7.item2": "If such short links were created, we may remove or redirect them without notice to prevent confusion or abuse.",

        "tos.section8.title": "8. Enforcement & suspension",
        "tos.section8.item1": "Repeated or intentional abuse may result in temporary or permanent suspension.",

        "tos.section9.title": "9. Contact",
        "tos.section9.item1": "If you have questions, contact us at hello@star-dev.xyz.",

        // --- Public pages: Privacy Policy (/privacy) ---
        "privacyPage.title": "Privacy Policy",
        "privacyPage.intro": "We take privacy seriously. This policy describes what data may be processed when using dcs.lol and why.",
        "privacyPage.lastUpdated": "Last updated: January 2026",

        "privacyPage.section1.title": "1. What data may be collected?",
        "privacyPage.section1.item1": "The original Discord invite link you want to shorten.",
        "privacyPage.section1.item2": "Technical metadata (e.g., browser/device) for rendering and troubleshooting.",
        "privacyPage.section1.item3": "IP address for abuse prevention (if technically required, potentially truncated/anonymized).",
        "privacyPage.section1.item4": "Anonymous or aggregated click statistics (e.g., number of visits).",

        "privacyPage.section2.title": "2. Why do we use this data?",
        "privacyPage.section2.item1": "Providing the service (creating and redirecting short links).",
        "privacyPage.section2.item2": "Security and abuse prevention (spam, scams, automated attacks).",
        "privacyPage.section2.item3": "Stability and improvement (diagnostics, performance).",

        "privacyPage.section3.title": "3. Sharing with third parties",
        "privacyPage.section3.item1": "We generally do not sell or rent personal data.",
        "privacyPage.section3.item2": "Exceptions may apply for legal obligations or to respond to security incidents.",
        "privacyPage.section3.item3": "Technical providers (e.g., hosting/CDN) may access necessary technical data to operate the service.",

        "privacyPage.section4.title": "4. Your rights",
        "privacyPage.section4.item1": "You may have rights to access, correction, deletion, and restriction (where applicable).",
        "privacyPage.section4.item2": "You may object to processing if legal requirements are met.",

        "privacyPage.contactTitle": "Contact",
        "privacyPage.contactText": "For privacy-related questions, contact us at:",

        // ...existing code...
    },
};

const STORAGE_KEY = "dcs.lol:lang";

const getInitialLanguage = (): string => {
    // 1) Persisted user preference
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "de" || stored === "en") return stored;
    } catch {
        // ignore
    }

    // 2) Browser language (fallback to en)
    const navLang = (typeof navigator !== "undefined" && navigator.language) ? navigator.language : "en";
    const normalized = navLang.toLowerCase();
    return normalized.startsWith("de") ? "de" : "en";
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
    const [language, setLanguage] = useState(getInitialLanguage);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch {
            // ignore
        }
    }, [language]);

    useEffect(() => {
        // Für SEO/Accessibility: HTML lang setzen
        try {
            document.documentElement.lang = language;
        } catch {
            // ignore
        }
    }, [language]);

    const t = useMemo(() => {
        return (key: string): string => translations[language]?.[key] || key;
    }, [language]);

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
