import React from 'react';

/* eslint-disable max-len */
const Spinner = () => (
  <svg
      height="80px"
      preserveAspectRatio="xMidYMid"
      style={{
        display: 'block',
        left: '50%',
        marginLeft: '-40px',
        marginTop: '-40px',
        position: 'absolute',
        shapeRendering: 'auto',
        top: '50%',
      }}
      viewBox="0 0 100 100"
      width="80px"
      xmlns="http://www.w3.org/2000/svg">
    <circle
        cx="50"
        cy="50"
        fill="none"
        r="30"
        stroke="#4c566a"
        strokeLinecap="round"
        strokeWidth="5"
        transform="rotate(128.566 50 50)">
      <animateTransform
          attributeName="transform"
          dur="1.5s"
          keyTimes="0;0.5;1"
          repeatCount="indefinite"
          type="rotate"
          values="0 50 50;180 50 50;720 50 50" />
      <animate
          attributeName="stroke-dasharray"
          dur="1.5s"
          keyTimes="0;0.5;1"
          repeatCount="indefinite"
          values="18.84955592153876 169.64600329384882;150.79644737231007 37.6991118430775;18.84955592153876 169.64600329384882" />
    </circle>
  </svg>
);
/* eslint-enable */

export default Spinner;
