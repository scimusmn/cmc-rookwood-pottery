/* eslint-disable */
import React, { Suspense, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PointLightHelper, DirectionalLightHelper } from "three";
import { OrbitControls, Html, useProgress, useHelper } from '@react-three/drei';
import structuredClone from '@ungap/structured-clone';
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
      {/* <ambientLight /> */}
      <pointLight ref={pointLight1} position={[1, 2.5, 4]} intensity={1.5} />
      <pointLight ref={pointLight2} position={[-3, 3, -3.5]} intensity={2.5} />
      <pointLight ref={pointLight3} position={[-1, 2, -1]} intensity={1.5} />
      <directionalLight
        position={[-6.5, 2.5, 7]}
        ref={dirLight1}
        color={'#fdfcfa'}
        lookAt={[0, 1, 0]}
        penumbra={2}
        castShadow
        intensity={2.75}
      />
      <directionalLight
        position={[0, 2.5, -5]}
        ref={dirLight2}
        color={'#fafcff'}
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
  const unfiredUserEdits = useRef();

  const wheelDragStartX = useRef(0);
  const wheelDragStartRotation = useRef(0);
  const wheelTargetRotation = useRef();
  
  // Camera configuration - Flats (tiles)
  const CAM_POSITION_FLATS = new THREE.Vector3(-4, 6, 0.45);
  const CAM_LOOKAT_FLATS = new THREE.Vector3(0, 0.15, 0.45);

  // Camera configuration - Vases
  const CAM_POSITION_VASES = new THREE.Vector3(-7.75, 1.8, 0.45);
  const CAM_LOOKAT_VASES = new THREE.Vector3(0, 0.68, 0.45);

  // Camera configuration - Compare screen
  const CAM_POSITION_COMPARE = new THREE.Vector3(-9, 1.75, 0);
  const CAM_LOOKAT_COMPARE = new THREE.Vector3(0, 0.6, 0);

  // const CAM_POSITION_FLAT_COMPARE = new THREE.Vector3(-9, 1.75, 0);
  // const CAM_LOOKAT_FLAT_COMPARE = new THREE.Vector3(0, 0.6, 0);

  const FLAT_ROTATION_COMPARE = [Math.PI/2, 0, Math.PI/2];

  const isFlat = PotteryScene.getIsFlatPiece(pieceName);
  const isAtomizer = PotteryScene.getIsAtomizerPiece(pieceName);

  useFrame((state, delta) => {
    if ( isAtomizer && !showCompare){
      // spinGroupRef.current.rotateOnAxis(SPIN_AXIS, SPIN_SPEED);
      wheelTargetRotation.current += SPIN_SPEED;
    }

    spinGroupRef.current.rotation.y += ( wheelTargetRotation.current - spinGroupRef.current.rotation.y ) * 0.05;

  });

  useLayoutEffect(() => {
    if (isFlat && !showCompare) {
      spinGroupRef.current.rotation.set( 0, -Math.PI/2, 0 );
      wheelTargetRotation.current = -Math.PI/2;
    } else if (!isFlat && !showCompare){
      // Exception - Static pinecone rotation 
      spinGroupRef.current.rotation.set( 0, -Math.PI, 0 );
      wheelTargetRotation.current = -Math.PI;
    } else {
      spinGroupRef.current.rotation.set( 0, 0, 0 );
      wheelTargetRotation.current = 0;
    }
  }, [showCompare]);

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

  useEffect(() => {
    if (showFired && !preFireEdits) {
      convertToFiredEdits(unfiredUserEdits.current);
    }
  }, [showFired])

  function onUserModelEdits(editsObj) {
    // Save edits to be handed to fired model
    unfiredUserEdits.current = editsObj;    
  }

  // Converts all unifred "before" colors to fired "after" colors
  function convertToFiredEdits(editsObj) {
    if (!editsObj) {
      setPreFireEdits({});
      return;
    }
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
          console.log('[WARNING] No after color for PBN', beforeColor);
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

  function onWheelDown (e) {
    if (showCompare) return;

    document.onmousemove = onWheelMove;
		document.onmouseup = onWheelUp;

    wheelDragStartX.current = e.clientX - (1920 / 2);
		wheelDragStartRotation.current = wheelTargetRotation.current;
  }

  function onWheelMove (e) {
    const wheelXOffset = ( e.clientX - (1920/2) ) - wheelDragStartX.current;
    wheelTargetRotation.current = wheelDragStartRotation.current + wheelXOffset * 0.02;
  }

  function onWheelUp (e) {
    document.onmousemove = null;
		document.onmouseup = null;
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
      <WheelModel modelPath={turntableModelPath} visible={!showCompare} onWheelDown={onWheelDown} /> 
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

  return (
    <div className="scene-container">
      <Canvas ref={canvasRef} 
        camera={{ 
          fov: 15, 
        }} 
        onCreated={({ gl }) => {
          gl.physicallyCorrectLights = true;
        }}
        shadows
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
