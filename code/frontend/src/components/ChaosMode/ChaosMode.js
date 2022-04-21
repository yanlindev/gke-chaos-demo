import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './chaos-mode.scss';
import Button from '../Button/Button';

const ChaosMode = () => {
  const [servicesData, setServicesData] = useState([]);

  // fetch pods data at load
  useEffect(() => {
    axios.get('/list-pods')
    .then(function (response) {
      // handle success
      setServicesData(response.data.pods);
      console.log(response.data.pods);
    })
  }, [])

  return (
    <div className='chaos-mode'>
      <div className='chaos-mode__title'>Chaos Mode</div>
      <div className='chaos-mode__inner'>
        <div className='services'>
          <div className='services__title'>Services:</div>
          <div className='services__content'>
            {
              servicesData.map(service => (
                <div className='service'>
                  <div className='service__name'>{service.name.replace(/\-.*/,'').charAt(0).toUpperCase() + service.name.replace(/\-.*/,'').slice(1)}</div>
                  <div className='service__status'>Status: <span className='dot'></span></div>
                  <Button
                    text='Terminate'
                    short='true'
                    red='true'
                  />
                </div>
              ))
            }
          </div>
        </div>

        <div className='nodes'>
          <div className='nodes__title'>Nodes:</div>
          <div className='services__content'>
            {
              servicesData.map(service => (
                <div className='service'>
                  <div className='service__name'>{service.cluster.charAt(0).toUpperCase() + service.cluster.slice(1)}</div>
                  <div className='service__status'>Status: <span className='dot'></span></div>
                  <Button
                    text='Terminate'
                    short='true'
                    red='true'
                  />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChaosMode;