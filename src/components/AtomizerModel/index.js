/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PRE_GLAZE_DEFAULT_COLOR, ERASER_COLOR_ID } from '../../data/ColorLookup';

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

  console.log('AtomizerModel', modelPath);

  const SPIN_AXIS = new THREE.Vector3(0, 1, 0);
  const SPIN_AXIS_FLAT = new THREE.Vector3(0, 0, 1);

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

  useFrame((state, delta) => {
    if ( dragging.current 
      && atomizerEnabled 
      && latestRayEvt.current ) {
      sprayAtomizer(latestRayEvt.current);
    }
    if (spinSpeed !== undefined && spinSpeed !== 0) {
      if (!rotation) {
        meshRef.current.rotateOnAxis(SPIN_AXIS, spinSpeed);
      } else {
        rotation
        meshRef.current.rotateOnAxis(SPIN_AXIS_FLAT, spinSpeed);
      }
    }
  });

  useLayoutEffect(() => {
    if (atomizerEnabled) {
      const canvas = canvasRef.current;

      canvas.width = 4096;
      canvas.height = 4096;

      const context = canvas.getContext("2d");
      if (context) {
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
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
      meshTargets.forEach(meshName => {
        applySwatch(meshName, PRE_GLAZE_DEFAULT_COLOR, true);
        currentColors.current[meshName] = PRE_GLAZE_DEFAULT_COLOR;
      });
    }

  }, []);

  function drawToCanvas({x, y, color}) {

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const rgb = hexToRgb(color);
    const colorStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;

    if (context) {

      // MULTI-CIRCLE SPRAY
      const dropletCount = 9;
      const sprayRadius = 175;
      for (let i = 0; i < dropletCount; i++) {
        const dropletRadius = 75 + Math.random() * 25;
        let r = sprayRadius * Math.sqrt(Math.random()); // Even distribution
        const theta = Math.random() * 2 * Math.PI;
        const xOffset = r * Math.cos(theta);
        const yOffset = r * Math.sin(theta);
        context.beginPath();
        context.arc(
          x - dropletRadius + xOffset,
          y - dropletRadius + yOffset,
          dropletRadius * 2,
          0,
          2 * Math.PI
        );
        context.fillStyle = colorStr;
        context.fill();
      }

      textureRef.current.needsUpdate = true;

    }
  }

  function sprayAtomizer({uv}) {
    // De-normalize to canvas dimensions
    let x = uv.x * canvasRef.current.width;
    let y = (1 - uv.y) * canvasRef.current.height;

    // Save low-res drawing data to recreate on other model
    // x,y values rounded to two decimal places to save memory
    x = Math.round(x * 100) / 100;
    y = Math.round(y * 100) / 100;

    const color = (currentDragColor.current || "#ff0000" );
    
    const sprayData = {x, y, color};
    atomizerPts.current.push(sprayData);

    drawToCanvas(sprayData);
  }

  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
    if (atomizerEnabled) {
      sprayAtomizer(e);
    } else {
      onRaycast(e);
    }
    e.stopPropagation();
  }

  function onTouchUp(e) {
    // console.log('onTouchUp', e);
    dragging.current = false;
    latestRayEvt.current = null;
    const {object} = e;
    // This color is now "permanent"
    currentColors.current[object.name] = activeColor;
    if (onUserEdits && visible) onUserEdits({colors: currentColors.current, atomizerPoints: atomizerPts.current});
    e.stopPropagation();
  }

  function onTouchEnter(e) {
    // console.log('onTouchEnter', e);
    if (!atomizerEnabled) {
      onRaycast(e);
    }
    e.stopPropagation();
  }

  function onTouchLeave(e) {
    // console.log('onTouchLeave', e);
    latestRayEvt.current = null;
    onRaycastLeave(e);
    e.stopPropagation();
  }

  function onTouchMove(e) {
    // console.log('onTouchMove', e);
    if ( dragging.current === true ) {
      latestRayEvt.current = e;
    }
    e.stopPropagation();
  }

  function onRaycast(e) {
    const {object} = e;
    if (dragging.current === true && currentDragColor.current) {
      applySwatch(object.name, currentDragColor.current);
    }
  }

  function onRaycastLeave(e) {
    const {object} = e;
    if (dragging.current === true) {
      dragging.current = false;
      if (!atomizerEnabled) applySwatch(object.name, currentColors.current[object.name]);
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

    clonedScene.traverse((object) => {
      if (object.isMesh && object.name === meshName) {
        console.log('Adding atomizer canvas to mesh:', meshName);
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
    // TODO: Replace with Object3D.getObjectByName()
    // https://threejs.org/docs/#api/en/core/Object3D.getObjectByName
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
      onPointerDown={visible ? onTouchDown : null}
      onPointerUp={visible ? onTouchUp : null}
      onPointerEnter={visible ? onTouchEnter : null}
      onPointerLeave={visible ? onTouchLeave : null}
      onPointerMove={visible ? onTouchMove : null}
      object={clonedScene}
      visible={visible}
      position={position || [0, 0, 0]}
      rotation={rotation || [0, 0, 0]}
      ref={meshRef}
    /> );
}
