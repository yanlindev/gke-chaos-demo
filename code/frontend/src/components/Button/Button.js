import React from 'react';
import './button.scss';

const Button = props => {
  return (
    props.externalLink ?
    <a className='button' href={props.externalLink} target='_blank'>
      <div>
        {props.text}
      </div>
    </a>
    :
    <button
      className='button'
    >
      {props.text}  
    </button>
  )
}

export default Button;