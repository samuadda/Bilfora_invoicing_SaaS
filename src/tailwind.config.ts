import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./app/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-vazirmatn)"],
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
