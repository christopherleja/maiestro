import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Soundfont from 'soundfont-player';

import { audioContext, changeInstrument, stopPlaying } from '../../store/songReducer'

const SoundfontProvider = ({ handleRecordNoteStart, 
  handleRecordNoteEnd, render }) => {

  // general access to the song reducer
  const song = useSelector(state => state.song)
  const { soundfontHostname, soundfont, format } = useSelector(state => state.song.constants)
  // used often enough it was worth getting uniquely
  const instrumentName = useSelector(state => state.song.config.instrumentName)
  const dispatch = useDispatch();

  // activeAudioNotes has to stay in local state, not redux, 
  // since it uses functions as values in the playnote function
  // fortunately, I only use it in this component anyway.
  const [ activeAudioNodes, setActiveAudioNodes ] = useState({})

  // to do: refactor this into redux?
  const [ instrument, setInstrument ] = useState(null)

  const loadInstrument = () => {
      // Re-trigger loading state
      setInstrument(null);
        Soundfont.instrument(audioContext, instrumentName, {
        format,
        soundfont,
        nameToUrl: (name, soundfont, format) => {
            return `${soundfontHostname}/${soundfont}/${name}-${format}.js`;
        },
        }).then(instrument => {
          dispatch({ type: changeInstrument.type, payload: instrument.name })
        setInstrument(instrument)
      })
    }

  const resumeAudio = () => {
      if (audioContext.state === 'suspended') {
        return audioContext.resume();
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
        const note = { pitch: midiNumber, time: start }
        handleRecordNoteStart(note)
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

        handleRecordNoteEnd(note)
      } 
  };

  // Clear any residual notes that don't get called with stopNote
  const stopAllNotes = () => {
    audioContext.resume().then(() => {
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

  const handlePlayback = () => {
    const { notes, totalTime } = song.recordedNotes
    if (notes.length){
      // delay playing note until the right time
      return notes.map(note => {
        setTimeout(() => {
          playNote(note.pitch)
        }, note.time);
        
        // and delay stopping it until the right moment
        setTimeout(() => {
          stopNote(note.pitch)
        }, note.endTime);
        
        // reset play button when the melody ends
        setTimeout(() => {
          dispatch({ type: stopPlaying.type })
        }, totalTime)

        setTimeout(() => {
          setActiveAudioNodes({})
        }, totalTime)
      }) 
    }
  }

  useEffect(() => {
    if (song.playing){
      if (song.recordedNotes.totalTime){
        handlePlayback();
      } else 
        return
  }
  }, [song.playing])

    return render({
      isLoading: !instrument,
      playNote: playNote,
      stopNote: stopNote,
      stopAllNotes: stopAllNotes,
    });
}

    export default SoundfontProvider;
