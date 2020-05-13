import React, { useState } from 'react';
import { Key } from '@tonaljs/tonal';
import KeyNote from './KeyNote'

const InstrumentContainer = () => {
    
    const scale = ["C", "C#", "D", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const keys = [
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p','[',']', '',] 

    const renderKeyboard = scale.map((note, index )=> {
    return <KeyNote key={note+index} keyEvent={keys[index]} note={note}>{note}</KeyNote>
    }
    )

    return(
        <>
        {document.addEventListener("keydown", e => console.log(e))}
        {renderKeyboard}
        </>
    ) 
}

export default InstrumentContainer