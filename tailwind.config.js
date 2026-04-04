/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0E14",
          secondary: "#111720",
          card: "#151C28",
          hover: "#1A2332",
          elevated: "#1E2738",
        },
        green: {
          glow: "#00FF88",
          bright: "#00E67A",
          mid: "#00CC6A",
          muted: "#0D3D26",
          subtle: "#0A2E1D",
        },
        red: {
          glow: "#FF3B5C",
          bright: "#E6354F",
          mid: "#CC2E45",
          muted: "#3D0D1A",
          subtle: "#2E0A14",
        },
        slate: {
          text: "#94A3B8",
          muted: "#64748B",
          border: "#1E293B",
          divider: "#253244",
        },
        gold: "#FFD700",
        electric: "#00BFFF",
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        body: ["Lexend", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      borderRadius: {
        pill: "9999px",
      },
      boxShadow: {
        "green-glow": "0 0 20px rgba(0, 255, 136, 0.15), 0 0 60px rgba(0, 255, 136, 0.05)",
        "red-glow": "0 0 20px rgba(255, 59, 92, 0.15), 0 0 60px rgba(255, 59, 92, 0.05)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 255, 136, 0.1)",
      },
    },
  },
  plugins: [],
};
