import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const InstrumentListProvider = ({  render }) => {
  const [ instrumentList, setInstrumentList ] = useState()
  const { soundfontHostname, soundfont} = useSelector(state => state.song.constants)

  useEffect(() => {
    loadInstrumentList()
  }, [])

  const loadInstrumentList = () => {
    fetch(`${soundfontHostname}/${soundfont}/names.json`)
      .then((response) => response.json())
      .then((data) => {
        setInstrumentList(data)
      });
  };

  return render(instrumentList);
}

export default InstrumentListProvider;