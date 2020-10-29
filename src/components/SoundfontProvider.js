import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Soundfont from 'soundfont-player';

import { stopPlaying } from '../store/songReducer'

const SoundfontProvider = (props) => {
  // To do: Refactor these into a separate environmental variables file
  const format = 'mp3';
  const soundfont = 'MusyngKite';

  // general access to the song reducer
  const song = useSelector(state => state.song)
  // used often enough it was worth getting uniquely
  const instrumentName = useSelector(state => state.song.config.instrumentName)
  const dispatch = useDispatch();

  // activeAudioNotes has to stay in local state, not redux, 
  // since it uses functions as values in the playnote function
  const [ activeAudioNodes, setActiveAudioNodes ] = useState({})

  // to do: refactor this into redux
  const [ instrument, setInstrument ] = useState(null)

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
    // get time relative to recording
    const start = Date.now() - song.time
    resumeAudio().then(() => {
      
      const audioNode = instrument.play(midiNumber);
      setActiveAudioNodes(Object.assign(activeAudioNodes, { [midiNumber]: audioNode }))
    });
      
      if (song.recording){
        // if recording, save note for posterity
        const note = { pitch: midiNumber, start }
        props.handleRecordNoteStart(note)
      } 
  };

  const stopNote = (midiNumber) => {
    resumeAudio().then(() => {
      if (!activeAudioNodes[midiNumber]) {
        return
      };
      // find and stop playing note
      const audioNode = activeAudioNodes[midiNumber];
      audioNode.stop();

      setActiveAudioNodes(Object.assign(activeAudioNodes, { [midiNumber]: null }));
    });
        
      if (song.recording){
        // find and save end time, add that to existing note objects array
        const endTime = Date.now() - song.time
        const note = { pitch: midiNumber, endTime }
        props.handleRecordNoteEnd(note)
      } 
  };

  // Clear any residual notes that don't get called with stopNote
  const stopAllNotes = () => {
    props.audioContext.resume().then(() => {
    const activeNodes = Object.values(activeAudioNodes);
    activeNodes.forEach(node => {
        if (node) node.stop();
      });
    });
  };

  // if user changes instrument, update instrument
  useEffect(() => {
    loadInstrument(instrumentName)
  }, [instrumentName])

  const handlePlayback = (noteArr) => {
    if (noteArr){
      // delay playing note until the right time
      return noteArr.notes.map(note => {
        setTimeout(() => {
          playNote(note.pitch)
        }, note.start);
        
        // and delay stopping it until the right moment
        setTimeout(() => {
          stopNote(note.pitch)
        }, note.endTime);
      })
    }
      return setTimeout(() => {
        dispatch({ type: stopPlaying.type })
      }, noteArr.totalTime)
  }

  useEffect(() => {
    if (song.playing){
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
