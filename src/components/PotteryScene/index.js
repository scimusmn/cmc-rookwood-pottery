import React, { Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import LoadableModel from '../LoadableModel';
import { OrbitControls } from '@react-three/drei';
import RenderStats from '../RenderStats';

function PotteryScene({ modelPath, mtlPath, scale }) {
  return (
    <div className='scene-container' >
    <p>{ scale }</p>
    <Canvas>
      <Suspense fallback={null}>
        <RenderStats />
        <OrbitControls minPolarAngle={Math.PI/2} maxPolarAngle={Math.PI/2} />
        <LoadableModel modelPath={modelPath} mtlPath={mtlPath} scale={scale} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
      </Suspense>
    </Canvas>
    </div>
  );
}

export default PotteryScene;
