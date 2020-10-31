import * as mm from '@magenta/music'

  // magentaCheckpoint is the api checkpoint maiestro connects to
  const magentaCheckpoint = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
  // melodyRNN will handle interactions with the neural network
  const melodyRNN = new mm.MusicRNN(magentaCheckpoint) 
  // rnnPlayer will play the sequence maiestro gets back from melodyRNN
  const rnnPlayer = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus')

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
  audioContext,
  melodyRNN,
  rnnPlayer
}

export default config