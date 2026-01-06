import type {Config} from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
        "./index.html",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                // Direkte Hex-Farben statt CSS-Variablen
                border: "#1e3a5f",
                input: "#1a2540",
                ring: "#10b981",
                background: "#0b1120",
                foreground: "#f0f4f8",
                primary: {
                    DEFAULT: "#10b981",
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#1e3a5f",
                    foreground: "#e2e8f0",
                },
                destructive: {
                    DEFAULT: "#ef4444",
                    foreground: "#ffffff",
                },
                muted: {
                    DEFAULT: "#1a2540",
                    foreground: "#94a3b8",
                },
                accent: {
                    DEFAULT: "#14b8a6",
                    foreground: "#ffffff",
                },
                popover: {
                    DEFAULT: "#1a2540",
                    foreground: "#f0f4f8",
                },
                card: {
                    DEFAULT: "#131c2e",
                    foreground: "#f0f4f8",
                },
                surface: {
                    DEFAULT: "#0f1729",
                    elevated: "#1a2540",
                    overlay: "#243352",
                },
            },
            fontFamily: {
                display: ["Instrument Serif", "serif"],
                sans: ["Satoshi", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
                lg: "0.875rem",
                md: "0.625rem",
                sm: "0.375rem",
            },
            keyframes: {
                "accordion-down": {
                    from: {height: "0"},
                    to: {height: "var(--radix-accordion-content-height)"},
                },
                "accordion-up": {
                    from: {height: "var(--radix-accordion-content-height)"},
                    to: {height: "0"},
                },
                "fade-up": {
                    "0%": {opacity: "0", transform: "translateY(20px)"},
                    "100%": {opacity: "1", transform: "translateY(0)"},
                },
                "fade-in": {
                    "0%": {opacity: "0"},
                    "100%": {opacity: "1"},
                },
                "slide-in": {
                    "0%": {transform: "translateX(-100%)"},
                    "100%": {transform: "translateX(0)"},
                },
                float: {
                    "0%, 100%": {transform: "translateY(0)"},
                    "50%": {transform: "translateY(-10px)"},
                },
                pulse: {
                    "0%, 100%": {opacity: "1"},
                    "50%": {opacity: "0.5"},
                },
                shimmer: {
                    "0%": {backgroundPosition: "-200% 0"},
                    "100%": {backgroundPosition: "200% 0"},
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-up": "fade-up 0.6s ease-out forwards",
                "fade-in": "fade-in 0.4s ease-out forwards",
                "slide-in": "slide-in 0.5s ease-out forwards",
                float: "float 6s ease-in-out infinite",
                pulse: "pulse 2s ease-in-out infinite",
                shimmer: "shimmer 2s linear infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;

