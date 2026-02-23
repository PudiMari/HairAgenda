/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'beauty-gold': '#D4AF37',
                'beauty-cream': '#FDFBF7',
                'beauty-terracotta': '#A0522D',
            }
        },
    },
    plugins: [],
}