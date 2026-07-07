module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#efe7d8',
        cream: '#f4eee1',
        sand: '#e4d9c2',
        ink: '#2f2a24',
        cocoa: '#5a5045',
        pine: '#41725f',
        clay: '#bd6b47',
        amber: '#cf9a48',
        slate: '#5f7480',
        olive: '#7d8a4f',
        denim: '#4f6d84'
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
        sketch: '3px 3px 0 rgba(90, 80, 69, 0.22)',
        sketchsm: '2px 2px 0 rgba(90, 80, 69, 0.18)'
      }
    }
  },
  plugins: []
}
