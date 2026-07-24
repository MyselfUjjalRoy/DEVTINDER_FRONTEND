import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        /*
         * ── DARK THEME ──
         * Deep midnight romantic — inspired by luxury dating apps.
         * Rich charcoal base + vivid rose + electric violet.
         */
        "devtinder-dark": {
          "primary":           "#ff2d55",  // vibrant rose-red (Tinder signature)
          "primary-content":   "#ffffff",
          "secondary":         "#bf5af2",  // electric violet
          "secondary-content": "#ffffff",
          "accent":            "#30d158",  // apple green — online indicators
          "accent-content":    "#ffffff",
          "neutral":           "#1c1c2e",
          "neutral-content":   "#e2e8f0",
          "base-100":          "#09090f",  // near-black with blue undertone
          "base-200":          "#0f0f1a",  // card background
          "base-300":          "#1a1a2e",  // elevated surfaces
          "base-content":      "#f0f0f5",  // primary text
          "info":              "#5ac8fa",
          "success":           "#30d158",
          "warning":           "#ffd60a",
          "error":             "#ff453a",
        },
      },
      {
        /*
         * ── LIGHT THEME ──
         * Clean modern warm — inspired by Bumble / Hinge light mode.
         * Crisp white base + deep rose + rich purple with excellent contrast.
         */
        "devtinder-light": {
          "primary":           "#e8184a",  // bold deep rose — great contrast on white
          "primary-content":   "#ffffff",
          "secondary":         "#7c3aed",  // vivid violet-700
          "secondary-content": "#ffffff",
          "accent":            "#059669",  // emerald-600 — online indicators
          "accent-content":    "#ffffff",
          "neutral":           "#f1f5f9",
          "neutral-content":   "#1e1b4b",
          "base-100":          "#ffffff",  // pure white
          "base-200":          "#f8f9fe",  // very subtle cool-white for cards
          "base-300":          "#eef0f8",  // borders / dividers
          "base-content":      "#1e1b4b",  // dark indigo text — WCAG AA on white
          "info":              "#0284c7",
          "success":           "#16a34a",
          "warning":           "#d97706",
          "error":             "#dc2626",
        },
      },
    ],
  },
};
