import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import LoadableOBJ from '../LoadableOBJ';

function PotteryScene({ objPath, mtlPath, scale }) {
  return (
    <div className='scene-container' >
    <p>{ scale }</p>
    <Canvas>
      <Suspense fallback={null}>
        <LoadableOBJ objPath={objPath} mtlPath={mtlPath} scale={scale} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
      </Suspense>
    </Canvas>
    </div>
  );
}

export default PotteryScene;
