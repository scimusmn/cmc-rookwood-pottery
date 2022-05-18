import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';

function KilnSequence({ kilnOverlay }) {
  const kilnOverlayRef = useRef();

  useEffect(() => {
    gsap.from(kilnOverlayRef.current, {
      y: '-1080px',
      // ease: 'bounce.out',
      ease: 'power4.out',
      duration: 1.25,
      delay: 0.5,
    });
  });

  return (
    <div className="kiln-sequence">
      <img src={kilnOverlay.localFile.publicURL} ref={kilnOverlayRef} alt="Kiln Overlay" />
    </div>
  );
}

KilnSequence.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  kilnOverlay: PropTypes.object.isRequired,
};

export default KilnSequence;
