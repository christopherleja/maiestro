import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
// import PropTypes from 'prop-types';
import Soundfont from 'soundfont-player';

import { stopPlaying } from '../store/songReducer'

const SoundfontProvider = (props) => {
  const format = 'mp3';
  const soundfont = 'MusyngKite';
  const instrumentName = useSelector(state => state.song.config.instrumentName)
  const dispatch = useDispatch();

  // let activeAudioNodes = {};

  const [ activeAudioNodes, setActiveAudioNodes ] = useState({})
  const [ instrument, setInstrument ] = useState(null)
  const song = useSelector(state => state.song)
  // const AAN = useSelector(state => state.song.activeAudioNodes)

const loadInstrument = () => {
    // Re-trigger loading state
    setInstrument(null);
      Soundfont.instrument(props.audioContext, instrumentName, {
      format,
      soundfont,
      nameToUrl: (name, soundfont, format) => {
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
        
        // const copy = {...activeAudioNodes, [midiNumber]: audioNode}
        setActiveAudioNodes(Object.assign(activeAudioNodes, { [midiNumber]: audioNode }))
          
        if (song.recording){
          const note = { pitch: midiNumber, start }
          props.handleRecordNoteStart(note)
        } 
      });
    };

    const stopNote = (midiNumber) => {
      // console.log(activeAudioNodes[midiNumber])
      resumeAudio().then(() => {
        if (!activeAudioNodes[midiNumber]) {
          return
        };
        const audioNode = activeAudioNodes[midiNumber];
        audioNode.stop();
        // const copy = { ...activeAudioNodes, [midiNumber]: null };
        setActiveAudioNodes(Object.assign(activeAudioNodes, { [midiNumber]: null }));
      });
          
        if (song.recording){
            const endTime = Date.now() - song.time
            const note = { pitch: midiNumber, endTime }
            props.handleRecordNoteEnd(note)
          } else {
            return
          }
    };

      // Clear any residual notes that don't get called with stopNote
      const stopAllNotes = () => {
        props.audioContext.resume().then(() => {
        const activeNodes = Object.values(activeAudioNodes);
        activeNodes.forEach(node => {
            if (node) {
            node.stop();
            }
        });
        });
    };

  useEffect(() => {
    loadInstrument(instrumentName)
  }, [instrumentName])

  const delayPlay = (note) => {
    setTimeout(() => {
      playNote(note.pitch)
    }, note.start)
  }

  useEffect(() => console.log(activeAudioNodes), [activeAudioNodes])

  const delayStop = (note) => {
    setTimeout(() => {
      stopNote(note.pitch)
    }, note.endTime)
  }

  const handlePlayback = (noteArr) => {
    // setActiveAudioNodes(Object)
    if (noteArr){
      return noteArr.notes.map(note => {
        delayPlay(note);
        delayStop(note);
      })
    }
      return setTimeout(() => {
        dispatch({ type: stopPlaying.type })
      }, noteArr.totalTime ? noteArr.totalTime : 0)
  }

  useEffect(() => {
    if (song.playing){
      setActiveAudioNodes({})
      console.log(activeAudioNodes)
      let scheduledNotes = props.handlePlayingRecordedNotes();
      if (scheduledNotes){
        handlePlayback(scheduledNotes);
      }
  } else return
  }, [song.playing])

    return props.render({
      isLoading: !instrument,
      playNote: playNote,
      stopNote: stopNote,
      stopAllNotes: stopAllNotes,
    });
}

    export default SoundfontProvider;
