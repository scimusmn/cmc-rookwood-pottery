import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

function RenderStats() {
  const { gl } = useThree();

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('=== Render stats ===');
      console.log('Scene polycount:', gl.info.render.triangles);
      console.log('Active Drawcalls:', gl.info.render.calls);
      console.log('Textures in Memory', gl.info.memory.textures);
      console.log('Geometries in Memory', gl.info.memory.geometries);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}

export default RenderStats;
