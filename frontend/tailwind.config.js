/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        steel: {
          950: "#14181c",
          900: "#1b2126",
          800: "#242c33",
          700: "#333e47",
          600: "#4a5761",
          500: "#66757f",
          400: "#8b98a1",
          300: "#b4bfc6",
          200: "#dbe1e4",
          100: "#eef1f2",
        },
        mango: {
          600: "#c97a1f",
          500: "#e6952e",
          400: "#f0ab4c",
          300: "#f6c581",
        },
        coriander: {
          600: "#3f7d4f",
          500: "#569166",
          400: "#7fac8b",
        },
        chili: {
          600: "#b6432f",
          500: "#cf5a44",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
