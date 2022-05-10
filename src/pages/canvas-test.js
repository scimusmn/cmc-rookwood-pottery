import React, { useState, useEffect, useRef } from 'react';

import Home from '../components/Home';

function Page() {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  const randomPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const inputInterval = setInterval(() => {
      randomPointRef.current = {
        x: Math.random() * 100,
        y: randomPointRef.current.y + 1,
      };
    }, 15);
    return () => clearInterval(inputInterval);
  }, []);

  useEffect(() => {
    const renderInterval = setInterval(() => {
      setPoint({
        x: randomPointRef.current.x,
        y: randomPointRef.current.y,
      });
    }, 100);
    return () => clearInterval(renderInterval);
  }, []);

  return (
    <Home nextPointX={point.x} nextPointY={point.y} />
  );
}

export default Page;
