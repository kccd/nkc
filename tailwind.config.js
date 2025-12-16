module.exports = {
  content: ['./pages/**/*.{pug,vue}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    screens: {
      // Bootstrap v3: sm ≥ 768px, md ≥ 992px, lg ≥ 1200px
      sm: '768px',
      md: '992px',
      lg: '1200px',
    },
    extend: {},
  },
  plugins: [],
};
