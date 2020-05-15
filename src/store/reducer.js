import { MidiNumbers } from 'react-piano'

const defaultState = {
  config: {
    instrumentName: 'acoustic_grand_piano',
    noteRange: {
        first: MidiNumbers.fromNote('c4'),
        last: MidiNumbers.fromNote('f5'),
    },
    keyboardShortcutOffset: 0,
    }, 
    soundfontHostname: 'https://d1pzp51pvbm36p.cloudfront.net',
    audioContext: new (window.AudioContext || window.webkitAudioContext)(),
    format: 'mp3',
    soundfont: 'MusyngKite',
    activeAudioNodes: {},
    instrument: null,
}

const reducer = ((state = defaultState, action) => {
  switch (action.type){
    case "SET_INSTRUMENT":
      return {...state, instrument: action.payload}
    default:
      return state
  }
})

export default reducer