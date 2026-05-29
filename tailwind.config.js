export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#F6E7D2',
        indigo: '#2B2C63',
        copper: '#B36B32',
        herbal: '#4F7A5A',
        amber: '#C07A1E',
        danger: '#8B1C1C'
      },
      boxShadow: {
        parchment: '0 10px 45px rgba(45, 37, 18, 0.12)'
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
