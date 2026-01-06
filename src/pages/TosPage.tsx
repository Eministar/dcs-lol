import {Link as RLink} from "react-router-dom";
import {useLanguage} from "../contexts/LanguageContext";

export default function TosPage() {
    const {t} = useLanguage();

    const sections = [
        {
            title: t("tos.section1.title"),
            items: [t("tos.section1.item1"), t("tos.section1.item2")],
        },
        {
            title: t("tos.section2.title"),
            items: [t("tos.section2.item1"), t("tos.section2.item2")],
        },
        {
            title: t("tos.section3.title"),
            items: [t("tos.section3.item1"), t("tos.section3.item2"), t("tos.section3.item3")],
        },
        {
            title: t("tos.section4.title"),
            items: [t("tos.section4.item1"), t("tos.section4.item2"), t("tos.section4.item3")],
        },
        {
            title: t("tos.section5.title"),
            items: [t("tos.section5.item1"), t("tos.section5.item2")],
        },
        {
            title: t("tos.section6.title"),
            items: [t("tos.section6.item1")],
        },
        {
            title: t("tos.section7.title"),
            items: [t("tos.section7.item1"), t("tos.section7.item2")],
        },
        {
            title: t("tos.section8.title"),
            items: [t("tos.section8.item1")],
        },
        {
            title: t("tos.section9.title"),
            items: [t("tos.section9.item1")],
        },
    ];

    return (
        <div className="min-h-[100dvh] bg-background text-foreground">
            <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t("tos.title")}</h1>
                    <RLink to="/" className="px-4 py-2 rounded-xl btn-secondary text-sm font-medium">
                        {t("common.back")}
                    </RLink>
                </div>

                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <p className="text-muted-foreground leading-relaxed">{t("tos.intro")}</p>
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

                    <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
                        {t("tos.lastUpdated")}
                    </div>
                </div>
            </div>
        </div>
    );
}
