import daisyui from "daisyui";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Jersey15: ["Jersey 15", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
};
