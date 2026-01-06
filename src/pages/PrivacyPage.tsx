import {Link as RLink} from "react-router-dom";
import {useLanguage} from "../contexts/LanguageContext";

export default function PrivacyPage() {
    const {t} = useLanguage();

    const sections = [
        {
            title: t("privacyPage.section1.title"),
            items: [t("privacyPage.section1.item1"), t("privacyPage.section1.item2"), t("privacyPage.section1.item3"), t("privacyPage.section1.item4")],
        },
        {
            title: t("privacyPage.section2.title"),
            items: [t("privacyPage.section2.item1"), t("privacyPage.section2.item2"), t("privacyPage.section2.item3")],
        },
        {
            title: t("privacyPage.section3.title"),
            items: [t("privacyPage.section3.item1"), t("privacyPage.section3.item2"), t("privacyPage.section3.item3")],
        },
        {
            title: t("privacyPage.section4.title"),
            items: [t("privacyPage.section4.item1"), t("privacyPage.section4.item2")],
        },
    ];

    return (
        <div className="min-h-[100dvh] bg-background text-foreground">
            <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t("privacyPage.title")}</h1>
                    <RLink
                        to="/"
                        className="px-4 py-2 rounded-xl btn-secondary text-sm font-medium"
                    >
                        {t("common.back")}
                    </RLink>
                </div>

                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <p className="text-muted-foreground leading-relaxed">{t("privacyPage.intro")}</p>
                    </div>

                    {sections.map((s) => (
                        <div key={s.title} className="bg-card border border-border rounded-2xl p-6">
                            <h2 className="text-xl font-semibold mb-3">{s.title}</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                {s.items.map((it) => (
                                    <li key={it}>• {it}</li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-3">{t("privacyPage.contactTitle")}</h2>
                        <p className="text-muted-foreground">
                            {t("privacyPage.contactText")} <span className="text-foreground">info@dcs.lol</span>
                        </p>
                    </div>

                    <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
                        {t("privacyPage.lastUpdated")}
                    </div>
                </div>
            </div>
        </div>
    );
}
