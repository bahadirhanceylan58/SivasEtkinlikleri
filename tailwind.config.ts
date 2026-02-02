import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "#FACC15",
                "primary-hover": "#EAB308",
                "primary-dark": "#CA8A04",
                accent: {
                    purple: "#8b5cf6",
                    pink: "#ec4899",
                    blue: "#3b82f6",
                    green: "#10b981",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                heading: ["var(--font-playfair)", "serif"],
                modern: ["var(--font-outfit)", "sans-serif"],
            },
            animation: {
                "fadeIn": "fadeIn 0.3s ease-out",
                "slideInUp": "slideInUp 0.5s ease-out",
                "slideInDown": "slideInDown 0.5s ease-out",
                "slideInLeft": "slideInLeft 0.5s ease-out",
                "slideInRight": "slideInRight 0.5s ease-out",
                "scaleIn": "scaleIn 0.4s ease-out",
                "bounceIn": "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                "shimmer": "shimmer 2s infinite linear",
                "float": "float 3s ease-in-out infinite",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                "rotate": "rotate 2s linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInUp: {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInDown: {
                    "0%": { opacity: "0", transform: "translateY(-30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInLeft: {
                    "0%": { opacity: "0", transform: "translateX(-30px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(30px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.9)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                bounceIn: {
                    "0%": { opacity: "0", transform: "scale(0.3)" },
                    "50%": { opacity: "1", transform: "scale(1.05)" },
                    "70%": { transform: "scale(0.9)" },
                    "100%": { transform: "scale(1)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(250, 204, 21, 0.3)" },
                    "50%": { boxShadow: "0 0 40px rgba(250, 204, 21, 0.6)" },
                },
                rotate: {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
            },
            boxShadow: {
                "glow": "0 0 20px rgba(250, 204, 21, 0.3)",
                "glow-lg": "0 0 40px rgba(250, 204, 21, 0.5)",
                "card": "0 4px 20px rgba(0, 0, 0, 0.1)",
                "card-hover": "0 10px 40px rgba(0, 0, 0, 0.2)",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [
        function ({ addBase }: any) {
            addBase({
                'input::placeholder, textarea::placeholder, select::placeholder': {
                    color: 'hsl(var(--foreground))',
                    opacity: '0.6',
                },
            });
        },
    ],
};
export default config;
