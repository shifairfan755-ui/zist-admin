/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BRAND COLORS
        primary: "#0D47A1",
        primaryLight: "#1976D2",
        primaryDark: "#002171",

        // APP BACKGROUND + TEXT
        bgLight: "#F4F7FE",
        textDark: "#1E293B",

        // SIDEBAR
        sidebarBg: "#0B1F3A",
        sidebarHover: "#14365A",

        // GRAY SYSTEM
        grayLight: "#EEF2F6",
        grayMid: "#CBD5E1",
        grayDark: "#64748B",

        // STATUS COLORS
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
      },

      // SMOOTH ROUNDED UI
      borderRadius: {
        card: "14px",
        soft: "10px",
      },

      // SHADOW PRESETS
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.06)",
        soft: "0 2px 12px rgba(0,0,0,0.05)",
      },

      // GRADIENTS FOR KPI CARDS
      backgroundImage: {
        "gradient-blue": "linear-gradient(135deg, #0D47A1, #1976D2)",
        "gradient-green": "linear-gradient(135deg, #0F9D58, #34A853)",
        "gradient-purple": "linear-gradient(135deg, #7B1FA2, #9C27B0)",
        "gradient-orange": "linear-gradient(135deg, #EF6C00, #FB8C00)",
      },

      // SMOOTH TRANSITIONS
      transitionProperty: {
        smooth: "all 0.25s ease",
      },
    },
  },
  plugins: [],
};
