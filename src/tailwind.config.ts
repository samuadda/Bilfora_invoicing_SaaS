import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./app/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                // IMPORTANT: Latin fonts FIRST for Western numerals (0-9)
                // Arabic font (Vazirmatn) LAST for Arabic characters
                // This forces browser to use Latin font for digits, fallback to Arabic for letters
                sans: [
                    "Inter",
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Helvetica Neue",
                    "Arial",
                    "var(--font-vazirmatn)",
                    "sans-serif",
                ],
            },
            colors: {
                brand: {
                    primary: "#7f2dfb",
                    primaryHover: "#6a1fd8",
                    dark: "#012d46",
                    background: "#f8f9fc",
                },
            },
        },
    },
    plugins: [],
};

export default config;
