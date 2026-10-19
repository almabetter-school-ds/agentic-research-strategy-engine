import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}", "./redux/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        "accent-blue": "hsl(var(--accent-blue))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        elevated: "hsl(var(--elevated))"
      },
      fontFamily: { sans: ["Inter", "Arial", "sans-serif"] },
      borderRadius: { xl: "14px", lg: "12px", md: "10px", sm: "6px" }
    }
  },
  plugins: [animate]
};
