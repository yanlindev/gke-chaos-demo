import React, { useState, useEffect } from 'react';
import './live-site.scss';
import { _VARIABLES } from '../../config.js';

const LiveSite = () => {
  const [iframeURL, setIframeURL] = useState();
  let i = 0;

  useEffect(() => {
    setInterval(() => {
      rotateIframeURL();
    }, 2000);
  }, []);

  const rotateIframeURL = () => {
    setIframeURL(_VARIABLES.SITE_URLS[i]);
    i = i > _VARIABLES.SITE_URLS.length - 1 ? 0 : i ++;
    console.log('ooo')
  }

  return (
    <div className='live-site'>
      <iframe src={iframeURL} title="Site Preview" scrolling="no" id="preview_iframe"></iframe>
    </div>
  )
}

export default LiveSite;