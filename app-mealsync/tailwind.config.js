/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#0B2545",
        background: "#FFFFFF",
        foreground: "#1F2937",
        primary: {
          DEFAULT: "#0B2545",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F3F4F6",
          foreground: "#1F2937",
        },
        accent: {
          DEFAULT: "#0D9F6C",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#C53030",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F9FAFB",
          foreground: "#6B7280",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        discovery: "#F6C84C",
        navy: "#0B2545",
        green: "#0D9F6C",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Belleza', 'serif'],
      },
      boxShadow: {
        'card': '0 6px 18px rgba(11, 37, 69, 0.06)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}