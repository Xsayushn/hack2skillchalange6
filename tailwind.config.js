/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#10B981",       // 0-50
          moderate: "#F59E0B",   // 51-100
          poor: "#F97316",       // 101-200
          unhealthy: "#EF4444",  // 201-300
          severe: "#8B5CF6",     // 301-400
          hazardous: "#7F1D1D",  // 401-500+
        }
      }
    },
  },
  plugins: [],
}
