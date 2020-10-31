const production = {
  url: "https://maiestro-backend.herokuapp.com"
}
const dev = {
  url: "http://localhost:3000"
}

const url = process.env.NODE_ENV === 'development' ? dev.url : production.url

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

const config = {
  soundfontHostname: 'https://d1pzp51pvbm36p.cloudfront.net',
  format: 'mp3',
  soundfont: 'MusyngKite',
  url,
  audioContext
}

export default config