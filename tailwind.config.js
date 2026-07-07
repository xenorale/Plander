module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf3e7',
        sand: '#f0e6d2',
        blush: '#f6c6d0',
        rose: '#e8a7b4',
        mint: '#bfe3d0',
        sage: '#9fceb6',
        lavender: '#d7cdf0',
        grape: '#b3a4e0',
        cocoa: '#6b5b4b',
        ink: '#4a4038'
      },
      fontFamily: {
        hand: ['"Patrick Hand"', 'Comic Sans MS', 'cursive'],
        script: ['"Caveat"', 'cursive']
      },
      borderRadius: {
        wobble: '18px 22px 20px 24px',
        blob: '30px 22px 28px 24px'
      },
      boxShadow: {
        sketch: '3px 3px 0 rgba(107, 91, 75, 0.22)',
        sketchsm: '2px 2px 0 rgba(107, 91, 75, 0.18)'
      }
    }
  },
  plugins: []
}
