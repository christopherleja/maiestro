import React from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
// import MdArrowDownward from 'react-icons/lib/md/arrow-downward';

import DimensionsProvider from './DimensionsProvider';
import InstrumentListProvider from './InstrumentListProvider';
import SoundfontProvider from './SoundfontProvider';
import PianoConfig from './PianoConfig';

const DURATION_UNIT = 0.2;
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
    
        return (
          <SoundfontProvider
            audioContext={this.props.audioContext}
            instrumentName={this.state.config.instrumentName}
            hostname={this.props.soundfontHostname}
            render={({ isLoading, playNote, stopNote, stopAllNotes }) => (
              <div>
                <div className="text-center">
                  <p className="">Click, tap, or use the keyboard to play!</p>
                  <div style={{ color: '#777' }}>
                    {/* <MdArrowDownward size={32} /> */}
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
                        disabled={isLoading}
                        width={containerWidth}
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