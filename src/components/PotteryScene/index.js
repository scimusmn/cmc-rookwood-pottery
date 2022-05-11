/* eslint-disable */
import React, { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
// import LoadableModel from '../LoadableModel';
import { OrbitControls } from '@react-three/drei';
import { DynamicModel } from '../DynamicModel';
import { HTMLCanvasMaterial } from '../HTMLCanvasMaterial';
// import DrawableCanvas from '../DrawableCanvas';
import RenderStats from '../RenderStats';

function PotteryScene({ modelPath, mtlPath, scale, color, texture }) {

  return (
    <div className="scene-container">
      <p>{ scale }</p>
      <Canvas>
        <Suspense fallback={null}>
          {/* <RenderStats /> */}
          <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
          {/* <LoadableModel modelPath={modelPath} mtlPath={mtlPath} scale={scale} /> */}
          <DynamicModel modelPath={modelPath} scale={scale} color={color} texture={texture} />
          {/* <HTMLCanvasMaterial canvas={drawCanvasRef} /> */}
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </Suspense>
      </Canvas>
      {/* <canvas ref={drawCanvasRef} height="128" width="128"/> */}
      {/* <DrawableCanvas height="128" width="128" /> */}
    </div>
  );
}

export default PotteryScene;
