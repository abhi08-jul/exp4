/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B0F19",
        panel: "#131826",
        accentFrom: "#7C3AED",
        accentTo: "#3B82F6",
        twitter: "#1DA1F2",
        instagram: "#E1306C",
        linkedin: "#0A66C2",
        facebook: "#1877F2",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      perspective: {
        1000: "1000px",
      },
    },
  },
  plugins: [],
};
