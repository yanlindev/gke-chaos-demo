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
      className={`button ${props.short ? 'button--short' : null} ${props.green ? 'button--green' : null} ${props.red ? 'button--red' : null}`}
      onClick={props.handleClick}
    >
      {props.text}  
    </button>
  )
}

export default Button;