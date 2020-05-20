import React from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';

import DimensionsProvider from './DimensionsProvider';
import InstrumentListProvider from './InstrumentListProvider';
import SoundfontProvider from './SoundfontProvider';
import PianoConfig from './PianoConfig';

const DURATION_UNIT = 0.25;
const DEFAULT_NOTE_DURATION = DURATION_UNIT;

class CustomPiano extends React.Component {

    state = {
        config: {
            instrumentName: 'acoustic_grand_piano',
            noteRange: {
                first: MidiNumbers.fromNote('c3'),
                last: MidiNumbers.fromNote('f4'),
        },
        keyboardShortcutOffset: 0,
        },
        keysDown: {},
        noteDuration: DEFAULT_NOTE_DURATION,
    };

    onPlayNoteInput = midiNumber => {
      this.setState({
        notesRecorded: false,
      });
    };
  
    onStopNoteInput = (midiNumber, { prevActiveNotes }) => {
      if (this.state.notesRecorded === false) {
        
        this.recordNotes(prevActiveNotes, this.state.noteDuration);
        this.setState({
          notesRecorded: true,
          noteDuration: DEFAULT_NOTE_DURATION,
        });
      }
    };

    recordNotes = (midiNumbers, duration) => {
    if (this.props.recording.mode !== 'RECORDING') {
      return;
    }
    const newEvents = midiNumbers.map(midiNumber => {
      return {
        midiNumber,
        time: this.props.recording.currentTime,
        duration: duration,
      };
    });
    

    this.props.setRecording({
      events: this.props.recording.events.concat(newEvents),
      currentTime: this.props.recording.currentTime + duration,
    });
  };

    render() {
        const keyboardShortcuts = KeyboardShortcuts.create({
          firstNote: this.state.config.noteRange.first + this.state.config.keyboardShortcutOffset,
          lastNote: this.state.config.noteRange.last + this.state.config.keyboardShortcutOffset,
          keyboardConfig: KeyboardShortcuts.HOME_ROW,
        });

        const {
          playNote,
          stopNote,
          recording,
          setRecording,
          ...pianoProps
        } = this.props;

        const { mode, currentEvents } = this.props.recording;
        const activeNotes = 
          mode === 'PLAYING' ? currentEvents.map(event => event.midiNumber) : null;

        return (
          
          <SoundfontProvider
            audioContext={this.props.audioContext}
            instrumentName={this.state.config.instrumentName}
            handleInstrumentChange={this.props.handleInstrumentChange}
            hostname={this.props.soundfontHostname}
            render={({ isLoading, playNote, stopNote, stopAllNotes }) => (
              <div>
                <div className="text-center">
                  <p className="">Click, tap, or use the keyboard to play!</p>
                  <div style={{ color: '#777' }}>
                  </div>
                </div>
                <div className="mt-4">
                  <DimensionsProvider>
                    {({ containerWidth }) => (
                      <Piano
                        noteRange={this.state.config.noteRange}
                        keyboardShortcuts={keyboardShortcuts}
                        playNote={playNote}
                        stopNote={stopNote}
                        onPlayNoteInput={this.onPlayNoteInput}
                        onStopNoteInput={this.onStopNoteInput}
                        activeNotes={activeNotes}
                        disabled={isLoading}
                        width={containerWidth}
                        {...pianoProps}
                      />
                      )}
                  </DimensionsProvider>
                </div>
                <div className="row mt-5">
                  <div className="col-lg-8 offset-lg-2">
                    <InstrumentListProvider
                      hostname={this.props.soundfontHostname}
                      render={(instrumentList) => (
                        <PianoConfig
                          config={this.state.config}
                          setConfig={(config) => {
                            this.setState({
                              config: Object.assign({}, this.state.config, config),
                            });
                            stopAllNotes();
                          }}
                          instrumentList={instrumentList || [this.state.config.instrumentName]}
                          keyboardShortcuts={keyboardShortcuts}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          />
        );
      }
    }
    
    export default CustomPiano;