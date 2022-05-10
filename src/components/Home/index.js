import React, { useState, useEffect } from 'react';

// eslint-disable-next-line react/prop-types
function Home({ nextPointX, nextPointY }) {
  const [prevPoint, setPrevPoint] = useState({ x: 0, y: 0 });

  function draw() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(nextPointX, nextPointY);
    ctx.stroke();
  }

  useEffect(() => {
    draw();
    setPrevPoint({ x: nextPointX, y: nextPointY });
  }, [nextPointX, nextPointY]);

  return (
    <div>
      <h1>Canvas render test</h1>
      <canvas id="canvas" width="500" height="500" />
    </div>
  );
}

export default Home;
