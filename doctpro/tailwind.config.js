/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        button: {
          primary: "#1f479d",
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  safelist: [
    {
      pattern: /^ant-/,
    },
  ],
  plugins: [],
};
