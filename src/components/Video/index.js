import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function Video({ src, active, fadeIn }) {
  const vidRef = useRef(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (active) {
      vidRef.current.currentTime = 0;
      vidRef.current.play();
      if (fadeIn) {
        setTimeout(() => {
          setFade(true);
        }, 200);
      }
    } else {
      vidRef.current.pause();
    }
  }, [active]);

  return (
    <video
      loop
      muted
      preload="auto"
      ref={vidRef}
      className={`fade-${fade}`}
    >
      <source src={src} />
      <track kind="captions" srcLang="en" src={null} />
    </video>
  );
}

Video.defaultProps = {
  fadeIn: false,
};

Video.propTypes = {
  src: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  fadeIn: PropTypes.bool,
};

export default Video;
