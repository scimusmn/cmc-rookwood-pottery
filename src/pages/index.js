import React, { useEffect } from 'react';
import { Link } from 'gatsby';

function IndexPage() {
  function touchMove(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    console.log('touch', x, y);
  }

  useEffect(() => {
    document.ontouchmove = touchMove;
    return () => { document.ontouchmove = null; };
  }, []);

  return (
    <div>
      <p>
        <Link to="/rookwood">Rookwood pottery interactive</Link>
      </p>
    </div>
  );
}

export default IndexPage;
