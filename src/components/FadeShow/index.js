import React, { useState } from 'react';
import useInterval from 'use-interval';
import PropTypes from 'prop-types';

function FadeShow({ delay, elements }) {
  const [fadeIndex, setFadeIndex] = useState(0);

  useInterval(() => {
    let nextIndex = fadeIndex + 1;
    if (nextIndex >= elements.length) nextIndex = 0;
    setFadeIndex(nextIndex);
  }, delay);

  return (
    <div className="fade-show">
      {elements.map((element, index) => (
        <p
          key={element}
          className={`fade-show-element ${(index === fadeIndex ? 'show' : '')}`}
        >
          {element}
        </p>
      ))}
    </div>
  );
}

FadeShow.defaultProps = {
  delay: 4000,
  elements: [],
};

FadeShow.propTypes = {
  delay: PropTypes.number,
  elements: PropTypes.arrayOf(PropTypes.string),
};

export default FadeShow;
