/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import COLOR_LOOKUP, { PRE_GLAZE_DEFAULT_COLOR, ERASER_COLOR_ID } from '../../data/ColorLookup';

export function AtomizerModel({
  modelPath, 
  activeColor, 
  visible, 
  edits, 
  onUserEdits,
  position,
  rotation,
  atomizerEnabled,
  spinSpeed
}) {

  const SPIN_AXIS = new THREE.Vector3(0, 1, 0);
  const SPIN_AXIS_FLAT = new THREE.Vector3(0, 0, 1);

  const RAYCAST_SPREAD = 0.125;

  const SPRAY_FRAME_INTERVAL = 4;

  const textureRef = useRef(null);

  let canvasRef;
  if (atomizerEnabled) canvasRef = useRef(document.createElement("canvas"));

  const { scene, nodes, materials } = useGLTF(modelPath);

  // We need to use a clone of the scene (mesh) so ThreeJS
  // will allow more than one instance to render in scene.
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const meshRef = useRef();
  const currentColors = useRef({});
  const currentMaterials = useRef({});
  const currentDragColor = useRef(null);
  const dragging = useRef(false);
  const latestRayEvt = useRef(null);
  const atomizerPts =  useRef([]);
  const sprayTicker = useRef(0);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const mouseVector = useRef(new THREE.Vector3());

  useFrame((state, delta) => {

    if (spinSpeed !== undefined && spinSpeed !== 0) {
      if (!rotation) {
        meshRef.current.rotateOnAxis(SPIN_AXIS, spinSpeed);
      } else {
        meshRef.current.rotateOnAxis(SPIN_AXIS_FLAT, spinSpeed);
      }
    }

    if (dragging.current === true && atomizerEnabled ) {      
      sprayTicker.current += 1;
      if (sprayTicker.current > SPRAY_FRAME_INTERVAL) {
        sprayTicker.current = 0;
        sprayFromMouse(latestRayEvt.current.ray, state.raycaster);
      }
    }
    
  });

  function sprayFromMouse(ray, raycaster) {

    mouseVector.current.set(
      (mouseX.current / 1920) * 2 - 1, 
      -(mouseY.current / 1080) * 2 + 1, 
      0.5
    );

    const { camera } = latestRayEvt.current;

    mouseVector.current.unproject(camera);

    // In order to paint across seams in the texture map
    // we perform two raycast to the left and right of mouse position

    raycaster.set( mouseVector.current, ray.direction );
    const intersects = raycaster.intersectObject( clonedScene );
    if ( intersects.length > 0 ) sprayAtomizer(intersects[0]);

    // LEFT of CENTER
    mouseVector.current.z -= RAYCAST_SPREAD;
    raycaster.set( mouseVector.current, ray.direction );
    const instersectsLeft = raycaster.intersectObject( clonedScene );
    if ( instersectsLeft.length > 0 ) sprayAtomizer(instersectsLeft[0]);

    // RIGHT of CENTER
    mouseVector.current.z += (RAYCAST_SPREAD * 2);
    raycaster.set( mouseVector.current, ray.direction );
    const instersectsRight = raycaster.intersectObject( clonedScene );
    if ( instersectsRight.length > 0 ) sprayAtomizer(instersectsRight[0]);

  }

  function releaseDrag() {
    dragging.current = false;
    sprayTicker.current = 0;

    document.onmouseup = null;
    document.onmousemove = null;

    dragging.current = false;
    latestRayEvt.current = null;

    if (onUserEdits && visible) {
      onUserEdits({colors: currentColors.current, atomizerPoints: atomizerPts.current});
    }
  }

  function mouseMove(e) {
    mouseX.current = e.clientX;
    mouseY.current = e.clientY;
  }

  useLayoutEffect(() => {
    if (atomizerEnabled) {
      const canvas = canvasRef.current;

      canvas.width = 4096;
      canvas.height = 4096;

      const context = canvas.getContext("2d");
      if (context) {
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = PRE_GLAZE_DEFAULT_COLOR.before;
        context.fill();
      }
    }

    const meshTargets = [];
    const topLevelTargets = [];
    clonedScene.traverse((object) => {
      if (object.id !== clonedScene.id) {
        if (object.isMesh || object.isGroup) {
          // Check if direct descendant of main scene
          if (object.parent.id === clonedScene.id) {
            object.displayName = object.name.toUpperCase();
            topLevelTargets.push(object.name);
          }
          meshTargets.push(object.name);
        }
      }
    });

    console.log('@ topLevelTargets', topLevelTargets);
    console.log('@ meshTargets', meshTargets);

    if (atomizerEnabled) {
      // Add canvas texture to existing material
      topLevelTargets.forEach(meshName => {
        addAtomizerCanvas(meshName);
      });
    } else {
      // Setting default color of all meshes once on load.
      topLevelTargets.forEach(meshName => {
        applySwatch(meshName, PRE_GLAZE_DEFAULT_COLOR.before, true);
        currentColors.current[meshName] = PRE_GLAZE_DEFAULT_COLOR.before;
      });
    }

  }, []);

  function drawToCanvas({x, y, color}) {

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const rgb = hexToRgb(color);
    const colorStrInner = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
    const colorStrOuter = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.0)`;
    let colorGradient;

    // MULTI-CIRCLE SPRAY
    const dropletCount = 7;
    const sprayRadius = 250;
    for (let i = 0; i < dropletCount; i++) {
      const dropletRadius = 250 + Math.random() * 50;
      let r = sprayRadius * Math.sqrt(Math.random()); // Even distribution
      const theta = Math.random() * 2 * Math.PI;
      const xOffset = r * Math.cos(theta);
      const yOffset = r * Math.sin(theta);
      const drawX = x + xOffset;
      const drawY = y + yOffset;
      context.beginPath();
      context.arc(
        drawX,
        drawY,
        dropletRadius,
        0,
        2 * Math.PI
      );
      colorGradient = context.createRadialGradient(drawX, drawY, 0, drawX, drawY, dropletRadius);
      colorGradient.addColorStop(0.4, colorStrInner);
      colorGradient.addColorStop(1, colorStrOuter);
      context.fillStyle = colorGradient;
      context.fill();
    }

    // context.beginPath();
    // context.arc(
    //   x,
    //   y,
    //   30,
    //   0,
    //   2 * Math.PI
    // );
    // context.fillStyle = 'red';
    // context.fill();

    textureRef.current.needsUpdate = true;

  }

  function sprayAtomizer({uv}) {
    // De-normalize to canvas dimensions
    let x = uv.x * canvasRef.current.width;
    let y = (1 - uv.y) * canvasRef.current.height;

    // Save low-res drawing data to recreate on other model
    // x,y values rounded to two decimal places to save memory
    x = Math.round(x * 100) / 100;
    y = Math.round(y * 100) / 100;

    // const color = (currentDragColor.current || "#ff0000" );
    const color = (currentDragColor.current || PRE_GLAZE_DEFAULT_COLOR.before );

    const sprayData = {x, y, color};
    atomizerPts.current.push(sprayData);

    drawToCanvas(sprayData);
  }

  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function onTouchDown(e) {
    // console.log('onTouchDown', e);
    dragging.current = true;
    latestRayEvt.current = e;

    if (visible) {
      document.onmouseup = releaseDrag;
      document.onmousemove = mouseMove;
    }

    if (atomizerEnabled) {
      sprayAtomizer(e);
    } else {
      paintByNumber(e);
    }
    e.stopPropagation();
  }

  function paintByNumber(e) {
    const {object} = e;
    if (currentDragColor.current) {
      // This color is now "permanent" if PBN mode
      currentColors.current[e.object.name] = activeColor;
      applySwatch(object.name, currentDragColor.current);
    }
  }

  function applySwatch(meshName, newColor, useClone) {
    
    // Note: incoming color is a string, not a THREE.Color object
    // should be a valid color string (https://threejs.org/docs/#api/en/math/Color.set)
    // e.g. '0x00ff00', 'red', or '#ff0000'

    let newMaterial;
    if (useClone) {
      newMaterial = materials[Object.keys(materials)[0]].clone();
      currentMaterials.current[meshName] = newMaterial;
    } else {
      newMaterial = currentMaterials.current[meshName];
    }
    newMaterial.color = new THREE.Color(newColor);

    setMaterialByMeshName(meshName, newMaterial, clonedScene);
  }

  function addAtomizerCanvas(meshName) {

    // Clone existing material to re-apply with canvas
    const newMaterial = materials[Object.keys(materials)[0]].clone();

    const canvasTexture = new THREE.CanvasTexture(canvasRef.current);
    newMaterial.map = canvasTexture;
    textureRef.current = canvasTexture;

    // Set material base color to white to allow for 
    // purer application of other colors. 
    newMaterial.color = new THREE.Color('white');

    clonedScene.traverse((object) => {
      if (object.isMesh && object.name === meshName) {
        object.material = newMaterial;
        return;
      }
    });
  }

  function setMaterialOfChildren(newMaterial, parentObject) {
    parentObject.traverse((object) => {
      if (object.isMesh) {
        object.material = newMaterial;
      }
    });
  }

  function setMaterialByMeshName(meshName, newMaterial, parentScene) {
    parentScene.traverse((object) => {
      if (object.isMesh && object.name === meshName) {
        object.material = newMaterial;
        return;
      } else if (object.isGroup && object.name === meshName) {
        setMaterialOfChildren(newMaterial, object);
      }
    });
  }

  useEffect(() => {
    clonedScene.traverse ( function (child) {
        if (child instanceof THREE.Mesh) {
            child.visible = visible;
        }
    });
  }, [visible]);

  // Apply user-made edits 
  // (usually coming from previous version of model)
  useEffect(() => {
    if (visible && edits) {
      if (edits.colors && !atomizerEnabled) {
        Object.keys(edits.colors).forEach(meshName => {
          applySwatch(meshName, edits.colors[meshName], true);
          currentColors.current[meshName] = edits.colors[meshName];
        });
      }
      if (edits.atomizerPoints && atomizerEnabled) {
        edits.atomizerPoints.forEach(drawData => {
          drawToCanvas(drawData);
        });
      }
    }
  }, [edits, visible]);

  useEffect(() => {
    // Set active color for atomizer and paint-by-number 
    let newColor = activeColor;
    // Eraser exception
    if (newColor === ERASER_COLOR_ID) newColor = PRE_GLAZE_DEFAULT_COLOR.before;
    currentDragColor.current = newColor;
  }, [activeColor]);

  return (
    <primitive
      onPointerDown={(visible && !spinSpeed) ? onTouchDown : null}
      object={clonedScene}
      visible={visible}
      position={position || [0, 0, 0]}
      rotation={rotation || [0, 0, 0]}
      ref={meshRef}
      castShadow
    /> );
}
