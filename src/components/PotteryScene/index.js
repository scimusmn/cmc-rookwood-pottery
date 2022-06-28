/* eslint-disable */
import React, { Suspense, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PointLightHelper, DirectionalLightHelper } from "three";
import { OrbitControls, Html, useProgress, useHelper } from '@react-three/drei';
import { AtomizerModel } from '../AtomizerModel';
import { WheelModel } from '../WheelModel';
import COLOR_LOOKUP from '../../data/ColorLookup';
import FINISHED_PIECES from '../../data/RookwoodPieces';

const SCENE_DEBUG_MODE = false;
const SPIN_AXIS = new THREE.Vector3(0, 1, 0);
const SPIN_SPEED = 0.2;

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
        lookAt={[0, 1, 0]}
        penumbra={2}
        castShadow
        intensity={3}
      />
    </>
  );
}

function SpinnerGroup({ 
  pieceName,
  modelPathBefore, 
  modelPathAfter, 
  turntableModelPath, 
  scale, 
  targetMesh, 
  activeColor, 
  onMeshTargetsReady, 
  showFired,
  showCompare
}) { 
  const [preFireEdits, setPreFireEdits] = useState(null);
  const spinGroupRef = useRef();

  const CAM_LOOKAT_TILES = new THREE.Vector3(0, 0, 0.5);
  const CAM_LOOKAT_VASES = new THREE.Vector3(0, 0.5, 0.5);

  useFrame((state, delta) => {
    if (!showCompare){
      spinGroupRef.current.rotateOnAxis(SPIN_AXIS, SPIN_SPEED);
    } else {
      spinGroupRef.current.rotation.set( 0, 0, 0 );
    }
  });

  useThree((state) => {
    state.camera.lookAt(
      PotteryScene.getIsAtomizerPiece(pieceName) ? CAM_LOOKAT_VASES : CAM_LOOKAT_TILES
    )
    state.camera.up = new THREE.Vector3(0, 1, 0);
    state.camera.updateProjectionMatrix();
  });

  function onUserModelEdits(editsObj) {
    console.log('onUserModelEdits', editsObj, showFired);
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
          console.log('[WARNING] No after color for pbn', beforeColor);
        }
      })
    }
    if (editsObj.atomizerPoints) {
      editsObj.atomizerPoints.forEach(atomizerPoint => {
        const beforeColor = atomizerPoint.color;
        let afterColor = null;
        Object.keys(COLOR_LOOKUP).forEach(k => {
          if (COLOR_LOOKUP[k].before === beforeColor) {
            afterColor = COLOR_LOOKUP[k].after;
          }
        })
        if (afterColor) {
          atomizerPoint.color = afterColor;
        } else {
          console.log('[WARNING] No after color for atomizer', beforeColor);
        }
      })
    }
    setPreFireEdits(editsObj);
  }

  function getIdealEdits(pieceName) {
    console.log('pieceName', pieceName);
    let lookupName = pieceName.toUpperCase().replace(/ /g, '_');
    // Exception: keys cannot begin with a number
    if (lookupName === '1926_LEGACY_PANEL_VASE') lookupName = 'PANEL_VASE_1926';
    if (FINISHED_PIECES[lookupName]) {
      return (FINISHED_PIECES[lookupName]);
    } else {
      console.log('[WARNING] Finshed piece data not found:', lookupName);
      return FINISHED_PIECES.ASHBEE_FLORA_TILE;
    }
  }

  return (
    <group ref={spinGroupRef} position={[0,0,0]}>
      <AtomizerModel 
        key="before-model"
        modelPath={modelPathBefore} 
        activeColor={activeColor} 
        visible={!showFired}
        atomizerEnabled={(PotteryScene.getIsAtomizerPiece(pieceName)) ? true : false}
        onUserEdits={(e) => onUserModelEdits(e)}
      />
      <AtomizerModel 
        key="after-model"
        modelPath={modelPathAfter} 
        scale={scale} 
        visible={showFired}
        atomizerEnabled={(PotteryScene.getIsAtomizerPiece(pieceName)) ? true : false}
        edits={preFireEdits}
        position={showCompare ? [0, 0, -1] : null}
        spinSpeed={showCompare ? SPIN_SPEED : 0}
      />
      <AtomizerModel 
        key="after-ideal-model"
        modelPath={modelPathAfter} 
        visible={showCompare}
        atomizerEnabled={(PotteryScene.getIsAtomizerPiece(pieceName)) ? true : false}
        edits={getIdealEdits(pieceName)}
        position={[0, 0, 1]}
        spinSpeed={showCompare ? SPIN_SPEED : 0}
      />
      <WheelModel modelPath={turntableModelPath} /> 
    </group>
  );
}

function PotteryScene({ 
  pieceName,
  modelPathBefore, 
  modelPathAfter, 
  turntableModelPath, 
  scale, 
  targetMesh, 
  activeColor, 
  onMeshTargetsReady, 
  showFired,
  showCompare
}) { 
    const canvasRef = useRef();
    const mouse = useRef([0, 0]);   
    
    const CAM_POSITION_TILES = [-6, 5, 0];
    const CAM_POSITION_VASES = [-8, 2, 0];

    function onCanvasMouseMove({ clientX: x, clientY: y }) {
      console.log('onCanvasMouseMove', x, y);
      mouse.current = [x, y];
    }

  return (
    <div className="scene-container">
      <Canvas ref={canvasRef} 
        camera={{ 
          fov: 15, 
          position: (PotteryScene.getIsAtomizerPiece(pieceName) ? CAM_POSITION_VASES : CAM_POSITION_TILES),
        }} 
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
          gl.gammaOutput = true;
        }}
      >
      {/* <Canvas ref={canvasRef} camera={ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }> */}
        <Suspense fallback={<ProgressLoader />}>
            {/* <OrbitControls target={[0, 0.75, 0]} /> */}
            {/* <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} /> */}
            <SpinnerGroup 
              pieceName={pieceName}
              modelPathBefore={modelPathBefore} 
              modelPathAfter={modelPathAfter} 
              turntableModelPath={turntableModelPath} 
              scale={scale} 
              targetMesh={targetMesh} 
              activeColor={activeColor} 
              onMeshTargetsReady={onMeshTargetsReady} 
              showFired={showFired}  
              showCompare={showCompare}
            />
            <Lighting />
        </Suspense>
      </Canvas>
    </div>
  );
}

PotteryScene.getIsAtomizerPiece = function(pieceName) {
  if (pieceName.toLowerCase().includes('tile') || pieceName.toLowerCase().includes('pine')) return false;
  return true;
}

export default PotteryScene;
