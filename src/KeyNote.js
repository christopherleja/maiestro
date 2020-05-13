import React, { useState } from 'react';
import * as Tone from 'tone'

const KeyNote = (props) => {
    let [playing, setPlaying] = useState('false')

    const startPlaying = () => {
        setPlaying = true
    }

    const stopPlaying = () => {
        setPlaying = false
    }

    let synth = new Tone.Synth().toMaster()

    const playSynth = (e) => {
        if (e.code === 'KeyQ')
        return synth.triggerAttackRelease('C4', '4n')
    }

    return <div onKeyDown={playSynth}>{props.note}</div>
}

export default KeyNote