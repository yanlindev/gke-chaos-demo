import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './chaos-mode.scss';

const ChaosMode = () => {
  const [podsData, setPodsData] = useState([]);

  // fetch pods data at load
  useEffect(() => {
    axios.get('/list-pods')
    .then(function (response) {
      // handle success
      setPodsData(response.data.pods);
      console.log(response.data.pods);
    })
  }, [])

  return (
    <div className='chaos-mode'>
      Chaos Mode
    </div>
  )
}

export default ChaosMode;