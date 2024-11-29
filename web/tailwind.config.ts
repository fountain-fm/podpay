import { nextui } from "@nextui-org/theme";

// Constants
const COLOR_PRIMARY = "#FFC300";
const COLOR_SECONDAY = "#6BDBBF";
const NOSTR_PURPLE = "#A855F7";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        nostr: {
          DEFAULT: NOSTR_PURPLE,
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: {
              DEFAULT: "#121212",
            },
            primary: {
              50: COLOR_PRIMARY,
              100: COLOR_PRIMARY,
              200: COLOR_PRIMARY,
              300: COLOR_PRIMARY,
              400: COLOR_PRIMARY,
              500: COLOR_PRIMARY,
              600: COLOR_PRIMARY,
              700: COLOR_PRIMARY,
              800: COLOR_PRIMARY,
              900: COLOR_PRIMARY,
              DEFAULT: COLOR_PRIMARY,
              foreground: "#000000",
            },
            secondary: {
              DEFAULT: COLOR_SECONDAY,
              foreground: "#000000",
            },
            focus: COLOR_PRIMARY,
          },
        },
      },
    }),
  ],
};
