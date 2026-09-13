/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          500: "#62748e",
          600: "#45556c",
          800: "#1d293d",
          900: "#0f172b",
        },
        teal: {
          50: "#f0fdfa",
          700: "#00786f",
        },
      },
      fontFamily: {
        sans: ['"Public Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        base: "12px",
      },
      boxShadow: {
        xs: "0px 1px 0.25px rgba(29,41,61,0.02)",
      },
    },
  },
  plugins: [],
};
