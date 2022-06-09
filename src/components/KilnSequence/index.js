import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';

function KilnSequence({ kilnOverlay }) {
  const kilnOverlayRef = useRef();

  useEffect(() => {
    gsap.from(kilnOverlayRef.current, {
      y: '-1080px',
      ease: 'power4.out',
      duration: 1.25,
      delay: 0.5,
    });

    gsap.set(kilnOverlayRef.current, {
      opacity: 0.5,
    });

    gsap.to(kilnOverlayRef.current, {
      opacity: 0.99,
      duration: 2.2,
      delay: 1.5,
      loop: -1,
      repeat: -1,
      repeatDelay: 0,
      yoyo: true,
    });
  });

  return (
    <div className="kiln-sequence">
      <img
        className="kiln-overlay"
        src={kilnOverlay.localFile.publicURL}
        ref={kilnOverlayRef}
        alt="Kiln Overlay"
        imgStyle={{ objectFit: 'contain' }}
        style={{
          width: '400px', height: '400px', transform: 'translate(-50%, -50%)', top: '50%', left: '50%', position: 'absolute',
        }}
      />
    </div>
  );
}

KilnSequence.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  kilnOverlay: PropTypes.object.isRequired,
};

export default KilnSequence;
