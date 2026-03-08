/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf3",
          100: "#d1fae5",
          500: "#16a34a",
          700: "#15803d",
          900: "#14532d"
        },
        ink: "#102a43",
        accent: "#ff6b35"
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(16, 42, 67, 0.25)"
      }
    }
  },
  plugins: []
};
