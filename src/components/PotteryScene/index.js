/* eslint-disable */
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// import { PointLightHelper, DirectionalLightHelper } from "three";
import { OrbitControls, Html, useProgress, useHelper } from '@react-three/drei';
import { DynamicModel } from '../DynamicModel';
import { WheelModel } from '../WheelModel';
import { HTMLCanvasMaterial } from '../HTMLCanvasMaterial';
import COLOR_LOOKUP from '../../data/ColorLookup';

const SCENE_DEBUG_MODE = false;
const SPIN_AXIS = new THREE.Vector3(0, 1, 0);
const SPIN_ANGLE = Math.PI / 2;

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

function SpinnerGroup({ 
  modelPathBefore, 
  modelPathAfter, 
  turntableModelPath, 
  scale, 
  targetMesh, 
  color, 
  onMeshTargetsReady, 
  showFired 
}) { 
  const [preFireEdits, setPreFireEdits] = useState(null);
  const spinGroupRef = useRef();

  console.log('SpinnerGroup', turntableModelPath);

  useFrame((state, delta) => {
    // spinGroupRef.current.rotation.x += 0.01;
    spinGroupRef.current.rotateOnAxis(SPIN_AXIS, 0.002);
  });

  function onUserModelEdits(editsObj) {
    // Replace before colors w after colors
    if (editsObj.colors) {
      Object.keys(editsObj.colors).forEach(key => {
        const beforeColor = editsObj.colors[key];
        let afterColor = null;
        Object.keys(COLOR_LOOKUP).forEach(k => {
          if (COLOR_LOOKUP[k].before === beforeColor) {
            afterColor = COLOR_LOOKUP[k].after;
          }
        })
        if (afterColor) {
          editsObj.colors[key] = afterColor;
        } else {
          console.log('[WARNING] No after color for', beforeColor);
        }
      })
    }
    setPreFireEdits(editsObj);
  }

  return (
    <group ref={spinGroupRef}>
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
      <WheelModel modelPath={turntableModelPath} />
    </group>
  );
}

function PotteryScene({ 
  modelPathBefore, 
  modelPathAfter, 
  turntableModelPath, 
  scale, 
  targetMesh, 
  color, 
  onMeshTargetsReady, 
  showFired 
}) { 
    const canvasRef = useRef();
    const mouse = useRef([0, 0]);    

    function onCanvasMouseMove({ clientX: x, clientY: y }) {
      console.log('onCanvasMouseMove', x, y);
      mouse.current = [x, y];
    }

  return (
    <div className="scene-container">
      <Canvas ref={canvasRef} camera={{ fov: 75, position: [-15, 44, 0]}} >
      {/* <Canvas ref={canvasRef} camera={ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }> */}
        <Suspense fallback={<ProgressLoader />}>
            <OrbitControls target={[0, 2, 0]}/>
            {/* <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} /> */}
            <SpinnerGroup 
              modelPathBefore={modelPathBefore} 
              modelPathAfter={modelPathAfter} 
              turntableModelPath={turntableModelPath} 
              scale={scale} 
              targetMesh={targetMesh} 
              color={color} 
              onMeshTargetsReady={onMeshTargetsReady} 
              showFired={showFired}  
            />
            <Lighting />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default PotteryScene;
