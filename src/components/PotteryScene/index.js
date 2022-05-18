/* eslint-disable */
import React, { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { DynamicModel } from '../DynamicModel';
import { HTMLCanvasMaterial } from '../HTMLCanvasMaterial';
import { Html, useProgress } from '@react-three/drei';

function ProgressLoader() {
  const { progress } = useProgress();
  return <Html center>{parseInt(progress)} % loaded</Html>
}

function PotteryScene({ modelPath, mtlPath, scale, targetMesh, color, texture, onMeshTargetsReady }) {

  return (
    <div className="scene-container">
      <Canvas>
        <Suspense fallback={<ProgressLoader />}>
          <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
          <DynamicModel 
            modelPath={modelPath} 
            scale={scale} 
            targetMesh={targetMesh} 
            color={color} 
            texture={texture} 
            onMeshTargetsReady={onMeshTargetsReady} 
          />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default PotteryScene;
