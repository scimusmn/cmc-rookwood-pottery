import { useThree } from '@react-three/fiber';
import React, { useState, useEffect } from 'react';
// import FPSStats from 'react-fps-stats';
import { Stats } from '@react-three/drei/core/Stats';

function RenderStats() {
  const { gl } = useThree();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // console.log('=== Render stats ===');
      // console.log('Scene polycount:', gl.info.render.triangles);
      // console.log('Active Drawcalls:', gl.info.render.calls);
      // console.log('Textures in Memory', gl.info.memory.textures);
      // console.log('Geometries in Memory', gl.info.memory.geometries);
      setStats(gl.info);
      console.log('stats', stats);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Stats showPanel={0} className="stats" right="0px" left="auto" graphWidth={50} />
  );
}

export default RenderStats;
