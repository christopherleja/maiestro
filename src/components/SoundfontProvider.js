import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types';
import Soundfont from 'soundfont-player';

const SoundfontProvider = (props) => {
  const format = 'mp3';
  const soundfont = 'MusyngKite';
  const instrumentName = useSelector(state => state.song.config.instrumentName )
  const [activeAudioNodes, setActiveAudioNodes] = useState({})
  const [ instrument, setInstrument ] = useState(null)
  const song = useSelector(state => state.song)

const loadInstrument = (instrument) => {
    // Re-trigger loading state
    setInstrument(null);
      Soundfont.instrument(props.audioContext, instrumentName, {
      format,
      soundfont,
      nameToUrl: (name, soundfont, format) => {
          console.log(`${props.hostname}/${soundfont}/${name}-${format}.js`)
          return `${props.hostname}/${soundfont}/${name}-${format}.js`;
      },
      }).then(instrument => {
      props.handleInstrumentChange(instrument)
      setInstrument(instrument)
      })
}

  const resumeAudio = () => {
      if (props.audioContext.state === 'suspended') {
        return props.audioContext.resume();
      } else {
        return Promise.resolve();
      }
    };

    const playNote = (midiNumber) => {
      const start = Date.now() - song.time
      resumeAudio().then(() => {
        const audioNode = instrument.play(midiNumber);
        setActiveAudioNodes(Object.assign({}, activeAudioNodes, {
            [midiNumber]: audioNode
          }))
        if (song.recording){
          let note = {pitch: midiNumber, time: start}
          props.handleRecordNoteStart(note)
        } else {
          return
        }
      });
    };

    const stopNote = (midiNumber) => {
      resumeAudio().then(() => {
        if (!activeAudioNodes[midiNumber]) {
          return;
        }
        const audioNode = activeAudioNodes[midiNumber];
        audioNode.stop();
        setActiveAudioNodes(Object.assign({}, activeAudioNodes, { [midiNumber]: null }))      
      });
      if (song.recording){
        const endTime = Date.now() - song.time
        const note = { pitch: midiNumber, endTime: endTime}
        props.handleRecordNoteEnd(note)
      } else {
        return
      }
    };

      // Clear any residual notes that don't get called with stopNote
      const stopAllNotes = () => {
        this.props.audioContext.resume().then(() => {
        const activeAudioNodes = Object.values(this.state.activeAudioNodes);
        activeAudioNodes.forEach(node => {
            if (node) {
            node.stop();
            }
        });
        this.setState({
            activeAudioNodes: {},
        });
        });
    };

  useEffect(() => {
    loadInstrument(instrumentName)
  }, [instrumentName])


  useEffect(() => {
    let scheduledNotes = props.handlePlayingRecordedNotes();
    if (scheduledNotes){
      scheduledNotes.notes.map(note => {
        setTimeout(()=> {
          playNote(note.pitch)
        }, note.start)

        setTimeout(() => {
          stopNote(note.pitch)
        }, note.start + note.duration)
      })
    }
  }, [song.playing])
  //   componentDidUpdate(prevProps, prevState) {
//     if (prevProps.instrumentName !== this.props.instrumentName) {
//       this.loadInstrument(this.props.instrumentName);
//       } else if (!prevProps.playing){
//         let scheduledNotes = this.props.handlePlayingRecordedNotes()
//         if (scheduledNotes ){
//           console.log({scheduledNotes})
//           scheduledNotes.notes.map(note => {
//             setTimeout(() => {
//             this.playNote(note.pitch)
//             }, note.start)

//             setTimeout(() => {
//             this.stopNote(note.pitch)
//           }, note.start + note.duration)
//         })
//         return setTimeout(() => this.props.stopPlaying(), scheduledNotes.totalTime)
//       } else if (prevProps.playing){
//         this.stopAllNotes()
//       } 
//     }
//   }

    return props.render({
    isLoading: !instrument,
    playNote: playNote,
    stopNote: stopNote,
    stopAllNotes: stopAllNotes,
    });
}

// class SoundfontProvider extends React.Component {
//     static propTypes = {
//         instrumentName: PropTypes.string.isRequired,
//         hostname: PropTypes.string.isRequired,
//         format: PropTypes.oneOf(['mp3', 'ogg']),
//         soundfont: PropTypes.oneOf(['MusyngKite', 'FluidR3_GM']),
//         audioContext: PropTypes.instanceOf(window.AudioContext),
//         render: PropTypes.func,
//     };

//     static defaultProps = {
//         format: 'mp3',
//         soundfont: 'MusyngKite',
//         instrumentName: 'acoustic_grand_piano',
//     };

//     constructor(props) {
//         super(props);
//         this.state = {
//         activeAudioNodes: {},
//         instrument: null,
//         playing: this.props.playing,
//         time: this.props.time
//         };
//     }

//     componentDidMount() {
//         this.loadInstrument(this.props.instrumentName);
//     }

//   componentDidUpdate(prevProps, prevState) {
//     if (prevProps.instrumentName !== this.props.instrumentName) {
//       this.loadInstrument(this.props.instrumentName);
//       } else if (!prevProps.playing){
//         let scheduledNotes = this.props.handlePlayingRecordedNotes()
//         if (scheduledNotes ){
//           console.log({scheduledNotes})
//           scheduledNotes.notes.map(note => {
//             setTimeout(() => {
//             this.playNote(note.pitch)
//             }, note.start)

//             setTimeout(() => {
//             this.stopNote(note.pitch)
//           }, note.start + note.duration)
//         })
//         return setTimeout(() => this.props.stopPlaying(), scheduledNotes.totalTime)
//       } else if (prevProps.playing){
//         this.stopAllNotes()
//       } 
//     }
//   }

//     loadInstrument = instrumentName => {
//         // Re-trigger loading state
//         this.setState({
//         instrument: null,
//         });
//         Soundfont.instrument(this.props.audioContext, instrumentName, {
//         format: this.props.format,
//         soundfont: this.props.soundfont,
//         nameToUrl: (name, soundfont, format) => {
//             return `${this.props.hostname}/${soundfont}/${name}-${format}.js`;
//         },
//         }).then(instrument => {
//         this.props.handleInstrumentChange(instrument.name)
//         this.setState({
//             instrument,
//         });
//         })
//     };

//     resumeAudio = () => {
//       if (this.props.audioContext.state === 'suspended') {
//         return this.props.audioContext.resume();
//       } else {
//         return Promise.resolve();
//       }
//     };

//   playNote = (midiNumber) => {
//     const start = Date.now() - this.props.time
//     this.resumeAudio().then(() => {
//       const audioNode = this.state.instrument.play(midiNumber);
//       this.setState({
//         activeAudioNodes: Object.assign({}, this.state.activeAudioNodes, {
//           [midiNumber]: audioNode
//         }),
//       });
//       if (this.props.recording){
//         let note = {pitch: midiNumber, time: start}
//         this.props.handleRecordNoteStart(note)
//       } else {
//         return
//       }
//     });
//   };

//   stopNote = (midiNumber) => {
//     this.resumeAudio().then(() => {
//       if (!this.state.activeAudioNodes[midiNumber]) {
//         return;
//       }
//       const audioNode = this.state.activeAudioNodes[midiNumber];
//       audioNode.stop();
//       this.setState({
//         activeAudioNodes: Object.assign({}, this.state.activeAudioNodes, { [midiNumber]: null }),
//       });
//     });
//     if (this.props.recording){
//       const endTime = Date.now() - this.props.time
//       const note = {pitch: midiNumber, endTime: endTime}
//       this.props.handleRecordNoteEnd(note)
//     } else {
//       return
//     }
//   };

//   // Clear any residual notes that don't get called with stopNote
//     stopAllNotes = () => {
//         this.props.audioContext.resume().then(() => {
//         const activeAudioNodes = Object.values(this.state.activeAudioNodes);
//         activeAudioNodes.forEach(node => {
//             if (node) {
//             node.stop();
//             }
//         });
//         this.setState({
//             activeAudioNodes: {},
//         });
//         });
//     };

//     render() {
//         console.log(this.props.time)
//         return this.props.render({
//         isLoading: !this.state.instrument,
//         playNote: this.playNote,
//         stopNote: this.stopNote,
//         stopAllNotes: this.stopAllNotes,
//         });
//     }
//     }

    export default SoundfontProvider;
