/* eslint-disable */
import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PointLightHelper, DirectionalLightHelper } from "three";
import { OrbitControls, Html, useProgress, useHelper } from '@react-three/drei';
import { DynamicModel } from '../DynamicModel';
import { HTMLCanvasMaterial } from '../HTMLCanvasMaterial';
// import { Outliner } from '../Outliner';

const SCENE_DEBUG_MODE = false;

function ProgressLoader() {
  const { progress } = useProgress();
  return <Html center>{parseInt(progress)} % loaded</Html>
}

function Lighting() {
  const pointLight1 = useRef();
  const pointLight2 = useRef();
  const pointLight3 = useRef();
  const dirLight1 = useRef();
  if (SCENE_DEBUG_MODE) {
    useHelper(pointLight1, PointLightHelper, 0.5, "hotpink");
    useHelper(pointLight2, PointLightHelper, 0.5, "red");
    useHelper(pointLight3, PointLightHelper, 0.5, "teal");
    useHelper(dirLight1, DirectionalLightHelper, 0.5, "green");
  }
  return (
    <>
      <ambientLight />
      <pointLight ref={pointLight1} position={[1, 0.5, 3]} intensity={4} />
      <pointLight ref={pointLight2} position={[-4, 1, 0]} intensity={3.5} />
      <pointLight ref={pointLight3} position={[0, 4, -1]} intensity={3} />
      <directionalLight
        position={[3, 2.5, -5]}
        ref={dirLight1}
        color={'#fafbff'}
        lookAt={[0, 0, 0]}
        penumbra={2}
        castShadow
        intensity={3}
      />
    </>
  );
}

function PotteryScene({ modelPathBefore, modelPathAfter, scale, targetMesh, color, onMeshTargetsReady, showFired }) { 
    
    const canvasRef = useRef();
    const mouse = useRef([0, 0]);
    const [preFireEdits, setPreFireEdits] = useState(null);

    function onCanvasMouseMove({ clientX: x, clientY: y }) {
        // console.log('onCanvasMouseMove', x, y);
        // mouse.current = [x, y];
      }

    function onUserModelEdits(editsObj) {
      setPreFireEdits(editsObj);
    }

  return (
    <div className="scene-container">
      <Canvas ref={canvasRef} >
        <Suspense fallback={<ProgressLoader />}>
          {/* <Outliner> */}
            <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
            <DynamicModel 
              key="before-model"
              modelPath={modelPathBefore} 
              scale={scale} 
              targetMesh={targetMesh} 
              color={color} 
              visible={!showFired}
              onMeshTargetsReady={onMeshTargetsReady} 
              onUserEdits={(e) => onUserModelEdits(e)} 
            />
            <DynamicModel 
              key="after-model"
              modelPath={modelPathAfter} 
              scale={scale} 
              visible={showFired}
              edits={preFireEdits}
            />
            <Lighting />
          {/* </Outliner> */}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default PotteryScene;
