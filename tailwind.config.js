/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16241F",
        surface: "#F4F6F5",
        panel: "#14232B",
        panel2: "#1C3240",
        steel: {
          400: "#5B93AC",
          500: "#2E6E8E",
          600: "#235774",
        },
        safety: {
          400: "#E58347",
          500: "#D4661E",
          600: "#A94F17",
        },
        gaz: {
          400: "#4F9A6F",
          500: "#2F7D52",
          600: "#245F3F",
        },
        valve: {
          400: "#CB5347",
          500: "#B23A2E",
          600: "#8C2C22",
        },
      },
      fontFamily: {
        display: ["Archivo Narrow", "sans-serif"],
        body: ["Inter", "sans-serif"],
        data: ["IBM Plex Mono", "monospace"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        checkPop: {
          "0%": { transform: "scale(0)" },
          "60%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
        dashMove: {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        drawCheck: {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
        drawCircle: {
          "0%": { strokeDashoffset: "220" },
          "100%": { strokeDashoffset: "0" },
        },
        overlayIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        modalPop: {
          "0%": { opacity: "0", transform: "scale(0.85) translateY(12px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        shrink: {
          "0%": { transform: "scaleX(1)" },
          "100%": { transform: "scaleX(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scaleIn 0.3s ease-out both",
        float: "float 4s ease-in-out infinite",
        "pulse-soft": "pulseSoft 1.8s ease-in-out infinite",
        "check-pop": "checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "dash-move": "dashMove 1.2s linear infinite",
        "draw-check": "drawCheck 0.5s 0.4s cubic-bezier(0.65, 0, 0.35, 1) both",
        "draw-circle": "drawCircle 0.6s cubic-bezier(0.65, 0, 0.35, 1) both",
        "overlay-in": "overlayIn 0.2s ease-out both",
        "modal-pop": "modalPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};
