import React, { Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import LoadableOBJ from '../LoadableOBJ';
import { OrbitControls } from '@react-three/drei';
import RenderStats from '../RenderStats';

function PotteryScene({ objPath, mtlPath, scale }) {
  return (
    <div className='scene-container' >
    <p>{ scale }</p>
    <Canvas>
      {/* <RenderStats /> */}
      <Suspense fallback={null}>
        <OrbitControls minPolarAngle={Math.PI/2} maxPolarAngle={Math.PI/2} />
        <LoadableOBJ objPath={objPath} mtlPath={mtlPath} scale={scale} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
      </Suspense>
    </Canvas>
    </div>
  );
}

export default PotteryScene;
