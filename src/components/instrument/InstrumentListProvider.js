import { useState, useEffect } from 'react';
import config from '../../constants';

const InstrumentListProvider = ({  render }) => {
  const [ instrumentList, setInstrumentList ] = useState()
  const { soundfontHostname, soundfont } = config

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