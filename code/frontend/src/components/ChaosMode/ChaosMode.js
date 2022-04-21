import React, { useState, useEffect } from 'react';
import axios from 'axios';
import $ from "jquery";
import './chaos-mode.scss';
import Button from '../Button/Button';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ChaosMode = () => {
  const [servicesData, setServicesData] = useState([]);
  const [nodesData, setNodesData] = useState([]);

  //Comparer Function    
  const getSortOrder = prop => {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
          return 1;    
        } else if (a[prop] < b[prop]) {    
          return -1;    
        }    
      return 0;    
    }    
  }

  // fetch services and nodes data at load
  useEffect(() => {
    axios.get('/list-pods')
    .then(function (response) {
      // handle success
      // setServicesData(response.data.pods);
      console.log(response.data.pods);
    })

    axios.get('/list-instances')
    .then(function (response) {
      // handle success
      setNodesData(response.data.instances.sort(getSortOrder("zone")));
      console.log(response.data.instances.filter(x => x.status == 'RUNNING'));
    })
  }, [servicesData, nodesData])

  // Toggle Service life
  const handleServiceToggle = podData => {
    const {name, cluster, zone} = podData;
    let fd = new FormData();
    fd.append('gke_pod', name);
    fd.append('gke_zone', zone);
    fd.append('gke_cluster', cluster);

    $.ajax({
      url: '/remove-pod',
      data: fd,
      type: 'POST',
      processData: false,
      contentType: false,
      cache: false,
      enctype: 'multipart/form-data',
      success: data => {
        console.log(data)
      }
    })
  }

  // Toggle Node life
  const handleNodeToggle = nodeData => {
    const {name, zone} = nodeData;
    let fd = new FormData();
    fd.append('instance_name', name);
    fd.append('instance_zone', zone);

    $.ajax({
      url: '/remove-instance',
      data: fd,
      type: 'POST',
      processData: false,
      contentType: false,
      cache: false,
      enctype: 'multipart/form-data',
      success: data => {
        console.log(data)
      }
    })
  }

  return (
    <div className='chaos-mode'>
      <div className='chaos-mode__title'>Chaos Mode</div>
      <div className='chaos-mode__inner'>
        {/* Service columns */}
        <div className='services'>
          <div className='services__title'>Services:<span>Active: ({servicesData.filter(x => x.status === ('Running' || 'RUNNING')).length}/{servicesData.length})</span></div>
          <div className='services__content'>
            {/* Render all service rows here */}
            {
              servicesData.length ?
                servicesData.map(service => (
                  <ServiceRow service={service} handleClick={handleServiceToggle}/>
              )) : <SkeletonPlaceHolder count={20} />
            }
          </div>
        </div>
        
        {/* Node columns */}
        <div className='nodes'>
          <div className='nodes__title'>Nodes:<span>Active: ({nodesData.filter(x => x.status === 'RUNNING').length}/{nodesData.length})</span></div>
          <div className='services__content'>
            {/* Render all Node rows here */}
            {
              nodesData.length ? nodesData.map(node => (
                <NodeRow node={node} handleClick={handleNodeToggle}/>
              )) : <SkeletonPlaceHolder count={20} />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

///////////////////////////////////////////////////////////
const ServiceRow = ({service, handleClick}) => service ? (
  <div className={`service ${service.status === 'Running' ? 'service--running' : 'service--down'}`} key={service.name}>
    <div className='service__name'>{service.name.replace(/\-.*/,'').charAt(0).toUpperCase() + service.name.replace(/\-.*/,'').slice(1)}</div>
    <div className='service__status'>Status: <span className='dot'></span></div>
    <Button
      text='Terminate'
      short='true'
      type={service.status === 'Running' ? 'red' : 'green'}
      handleClick={() => handleClick(service)}
    />
  </div>
) : <Skeleton count={3} />

const NodeRow = ({node, handleClick}) => (
  <div className='node' key={node.name}>
    <div className='node__name'>{node.zone}</div>
    <div className='node__status'>Status: <span className='dot'></span></div>
    <Button
      text='Terminate'
      short='true'
      type={node.status === 'RUNNING' ? 'red' : 'green'}
      handleClick={() => handleClick(node)}
      hasPendingState='true'
    />
  </div>
)

const SkeletonPlaceHolder = ({count}) => <Skeleton className='skeleton' count={count} />

export default ChaosMode;