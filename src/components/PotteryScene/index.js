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
const SPIN_SPEED = 0.01;

function ProgressLoader() {
  const { progress } = useProgress();
  return <Html center>{parseInt(progress)} % loaded</Html>
}

function Lighting() {
  const pointLight1 = useRef();
  const pointLight2 = useRef();
  const pointLight3 = useRef();
  const dirLight1 = useRef();
  const dirLight2 = useRef();
  if (SCENE_DEBUG_MODE) {
    useHelper(pointLight1, PointLightHelper, 0.5, "hotpink");
    useHelper(pointLight2, PointLightHelper, 0.5, "red");
    useHelper(pointLight3, PointLightHelper, 0.5, "teal");
    useHelper(dirLight1, DirectionalLightHelper, 0.5, "white");
    useHelper(dirLight2, DirectionalLightHelper, 0.5, "green");
  }
  return (
    <>
      <ambientLight />
      <pointLight ref={pointLight1} position={[1, 2.5, 4]} intensity={2.5} />
      <pointLight ref={pointLight2} position={[-3, 3, -3.5]} intensity={3} />
      <pointLight ref={pointLight3} position={[0, 2.5, -1]} intensity={2.5} />
      <directionalLight
        position={[-7, 2.5, 7]}
        ref={dirLight1}
        color={'#fafbff'}
        lookAt={[0, 1, 0]}
        penumbra={2}
        castShadow
        intensity={2.5}
      />
      <directionalLight
        position={[2, 2.5, -5]}
        ref={dirLight2}
        color={'#fafbff'}
        lookAt={[0, 2, 0]}
        penumbra={2}
        castShadow
        intensity={1.25}
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
  activeColor, 
  showFired,
  showCompare
}) { 
  const [preFireEdits, setPreFireEdits] = useState(null);
  const spinGroupRef = useRef();

  // Camera configuration - Flats (tiles)
  const CAM_POSITION_FLATS = new THREE.Vector3(-5, 6, 0.5);
  const CAM_LOOKAT_FLATS = new THREE.Vector3(0, 0.15, 0.5);

  // Camera configuration - Vases
  const CAM_POSITION_VASES = new THREE.Vector3(-8, 1.75, 0.5);
  const CAM_LOOKAT_VASES = new THREE.Vector3(0, 0.6, 0.5);

  // Camera configuration - Compare screen
  const CAM_POSITION_COMPARE = new THREE.Vector3(-9, 1.75, 0);
  const CAM_LOOKAT_COMPARE = new THREE.Vector3(0, 0.6, 0);

  // const CAM_POSITION_FLAT_COMPARE = new THREE.Vector3(-9, 1.75, 0);
  // const CAM_LOOKAT_FLAT_COMPARE = new THREE.Vector3(0, 0.6, 0);

  const FLAT_ROTATION_COMPARE = [Math.PI/2, 0, Math.PI/2];

  const isFlat = PotteryScene.getIsFlatPiece(pieceName);
  const isAtomizer = PotteryScene.getIsAtomizerPiece(pieceName);

  useFrame((state, delta) => {
    if (!isFlat && !showCompare){
      // spinGroupRef.current.rotateOnAxis(SPIN_AXIS, SPIN_SPEED);

      // TEMP - Static pinecone rotation for v1
      spinGroupRef.current.rotation.set( 0, -Math.PI, 0 );
    } else if (isFlat && !showCompare) {
      if (isFlat) {
        spinGroupRef.current.rotation.set( 0, -Math.PI/2, 0 );
      } else {
        spinGroupRef.current.rotation.set( 0, 0, 0 );
      }
    } else {
      spinGroupRef.current.rotation.set( 0, 0, 0 );
    }
  });

  useThree((state) => {
    let camPos;
    let camLook;
    if (!showCompare) {
      camPos = isFlat ? CAM_POSITION_FLATS : CAM_POSITION_VASES;
      camLook = isFlat ? CAM_LOOKAT_FLATS : CAM_LOOKAT_VASES;
    } else {
      camPos = CAM_POSITION_COMPARE;
      camLook = CAM_LOOKAT_COMPARE;
    }
    state.camera.position.set(camPos.x, camPos.y, camPos.z);
    state.camera.lookAt(camLook);
    state.camera.up = new THREE.Vector3(0, 1, 0);
    state.camera.updateProjectionMatrix();
  });

  function onUserModelEdits(editsObj) {
    console.log('PotteryScene.onUserModelEdits', showFired);
    console.log(editsObj);
    const clonedEditsObj = structuredClone(editsObj);
    // Replace before colors w after colors
    if (clonedEditsObj.colors) {
      Object.keys(clonedEditsObj.colors).forEach(key => {
        const beforeColor = clonedEditsObj.colors[key];
        let afterColor = null;
        Object.keys(COLOR_LOOKUP).forEach(k => {
          if (COLOR_LOOKUP[k].before === beforeColor) {
            afterColor = COLOR_LOOKUP[k].after;
          }
        })
        if (afterColor) {
          clonedEditsObj.colors[key] = afterColor;
        } else {
          console.log('[WARNING] No after color for pbn', beforeColor);
        }
      })
    }
    if (clonedEditsObj.atomizerPoints) {
      clonedEditsObj.atomizerPoints.forEach(atomizerPoint => {
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
    setPreFireEdits(clonedEditsObj);
  }

  function getIdealEdits(pieceName) {
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
    <group ref={spinGroupRef} position={(showFired && !showCompare) ? [0, 0, -9] : null}>
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
        position={showCompare ? [0, (showCompare && PotteryScene.getIsFlatPiece(pieceName) ? 0.82 : 0), -0.75] : null}
        rotation={(showCompare && PotteryScene.getIsFlatPiece(pieceName)) ? FLAT_ROTATION_COMPARE : null}
        spinSpeed={showCompare ? SPIN_SPEED : 0}
      />
      <AtomizerModel 
        key="after-ideal-model"
        modelPath={modelPathAfter} 
        visible={showCompare}
        atomizerEnabled={(PotteryScene.getIsAtomizerPiece(pieceName)) ? true : false}
        edits={getIdealEdits(pieceName)}
        position={[0, (showCompare && PotteryScene.getIsFlatPiece(pieceName) ? 0.82 : 0), 0.75]}
        rotation={(showCompare && PotteryScene.getIsFlatPiece(pieceName)) ? FLAT_ROTATION_COMPARE : null}
        spinSpeed={showCompare ? SPIN_SPEED : 0}
      />
      <WheelModel modelPath={turntableModelPath} visible={!showCompare} /> 
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

    // function onCanvasMouseMove({ clientX: x, clientY: y }) {
    //   console.log('onCanvasMouseMove', x, y);
    //   mouse.current = [x, y];
    // }

  return (
    <div className="scene-container">
      <Canvas ref={canvasRef} 
        camera={{ 
          fov: 15, 
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

PotteryScene.getIsFlatPiece = function(pieceName) {
  if (pieceName.toLowerCase().includes('tile')) return true;
  return false;
}

PotteryScene.getIsAtomizerPiece = function(pieceName) {
  if (pieceName.toLowerCase().includes('tile') || pieceName.toLowerCase().includes('pine')) return false;
  return true;
}

export default PotteryScene;
