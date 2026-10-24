/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Manrope'", "'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#05070D",
          900: "#080C16",
          850: "#0B111F",
          800: "#0F1729",
          700: "#152036",
          600: "#1D2B47",
        },
        mist: {
          800: "rgba(226,236,255,0.06)",
          700: "rgba(226,236,255,0.10)",
          600: "rgba(226,236,255,0.16)",
        },
        accent: {
          cyan: "#38E1FF",
          blue: "#4C8DFF",
          teal: "#2DD9C4",
          violet: "#8B7CFF",
        },
        state: {
          ready: "#34D399",
          boundary: "#F5B84E",
          urgent: "#FB6A6A",
          unavailable: "#7C8AA6",
        },
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(226,236,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,236,255,0.045) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(600px circle at var(--x,50%) var(--y,20%), rgba(56,225,255,0.10), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,225,255,0.15), 0 0 40px -12px rgba(56,225,255,0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -24px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 0.5, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.08)" },
        },
        "flow-dot": {
          "0%": { offsetDistance: "0%", opacity: 0 },
          "8%": { opacity: 1 },
          "92%": { opacity: 1 },
          "100%": { offsetDistance: "100%", opacity: 0 },
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
