import React, { useState, useEffect } from 'react';
import './load-generator.scss';
import Chart from './Chart/Chart';
import Button from '../Button/Button';
import axios from 'axios';

const today = new Date();

const LiveSite = () => {
  // Variables
  const MAX_DATA_ITEMS = 4;
  const [chartData, setChartData] = useState([100]);
  const [chartTime, setChartTime] = useState([today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()]);

  // Function that runs once when conponent is loaded
  useEffect(() => {
    setInterval(() => {
      handleGetLoad();
    }, 5000);
  }, [])

  // Handle generate load
  const handleGenerateLoad = () => {
    axios.get('/increase-load')
    .then(response => {
      // Handle success
      handleGetLoad();
    })
  }

  // Get current load data every 5 seconds
  const handleGetLoad = () => {
    axios.get('/get-load')
    .then(response => {
      // handle success
      // Update load data
      setChartData(chartData => [...chartData, response.data.current_load]);
      // Update time
      setChartTime(chartTime => [...chartTime, today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()]);
    })
  }

  return (
    <div className='load-generator'>
      <div className='load-generator__title'>Load Generator</div>
      <div className='load-generator__inner'>
        <Button className='button' text='Generate Load' handleClick={handleGenerateLoad}/>
        <Chart
          chartData={chartData}
          labels={chartTime}
        />
      </div>
    </div>
  )
}

export default LiveSite;