/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import COLOR_LOOKUP, { PRE_GLAZE_DEFAULT_COLOR, ERASER_COLOR_ID } from '../../data/ColorLookup';

export function AtomizerModel({
  modelPath, 
  activeColor, 
  visible, 
  edits, 
  onUserEdits,
}) {

  console.log('AtomizerModel', modelPath);

  const ATOMIZER_CANVAS_COLS = 55;
  const ATOMIZER_CANVAS_ROWS = 1;

  const canvasRef = useRef(document.createElement("canvas"));
  const textureRef = useRef(null);

  const { scene, nodes, materials } = useGLTF(modelPath);

  const mesh = useRef();
  const currentColors = useRef({});
  const currentDragColor = useRef(null);
  const dragging = useRef(false);
  const currentMaterials = useRef({});
  const latestRayEvt = useRef(null);
  const atomizerPts =  useRef([]);

  useFrame((state, delta) => {
    // console.log('f', dragging.current);
    if (dragging.current === true && latestRayEvt.current) {
      sprayAtomizer(latestRayEvt.current);
    }
  });

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 512;
    canvas.height = 1024;

    const context = canvas.getContext("2d");
    if (context) {
      context.rect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.fill();
    }
  }, []);

  function drawToCanvas({y, color}) {

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    console.log('d', color);

    if (context) {

      // MULTI-HORIZONTAL LINE
      const lineCount = 3;
      for (let i = 0; i < lineCount; i++) {
        context.lineWidth = 1 + Math.ceil(Math.random() * 5);
        context.strokeStyle = color + '15'; // Append low-opacity hex
        context.beginPath();
        let yOffset = (Math.random() * 1.5 + 1);
        yOffset = yOffset * yOffset;
        if (Math.random() < 0.5) yOffset *= -1;
        context.moveTo(0, y + yOffset);
        context.lineTo(canvas.width, y + yOffset);
        context.stroke();
      }

      textureRef.current.needsUpdate = true;

    }
  }

  function sprayAtomizer({uv}) {
    if (uv) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // De-normalize to canvas dimensions
      let x = uv.x * canvas.width;
      let y = (1 - uv.y) * canvas.height;

      // Shift to paint on "real" texture tile (to be repeated)
      x *= ATOMIZER_CANVAS_COLS;
      y *= ATOMIZER_CANVAS_ROWS;

      // Shift to paint on "real" texture tile (to be repeated)
      x = x % canvas.width;
      y = y % canvas.height;

      const color = (currentDragColor.current ||"#ff0000" );

      // Save low-res drawing data to recreate on other model
      const sprayData = {y, color};
      atomizerPts.current.push(sprayData);

      drawToCanvas(sprayData);

    }
  }

  function onTouchDown(e) {
    // console.log('onTouchDown', e);
    dragging.current = true;
    latestRayEvt.current = e;
    sprayAtomizer(e);
    e.stopPropagation();
    // onRaycast(e);
  }

  function onTouchUp(e) {
    // console.log('onTouchUp', e);
    dragging.current = false;
    latestRayEvt.current = null;
    e.stopPropagation();
    const {object} = e;
    console.log(atomizerPts.current);
    // This color is now "permanent"
    currentColors.current[object.name] = activeColor;
    if (onUserEdits && visible) onUserEdits({colors: currentColors.current, atomizerPoints: atomizerPts.current});
  }

  function onTouchEnter(e) {
    // console.log('onTouchEnter', e);
    onRaycast(e);
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
      // applySwatch(object.name, currentDragColor.current);
    }
  }

  function onRaycastLeave(e) {
    const {object} = e;

    if (dragging.current === true) {
      // dragging.current = false;
      // applySwatch(object.name, currentColors.current[object.name]);
    }
  }

  function applySwatch(meshName, newColor, useClone) {
    
    // Note: color is a string, not a THREE.Color object
    // should be a valid color string (https://threejs.org/docs/#api/en/math/Color.set)
    // e.g. '0x00ff00', 'red', or '#ff0000'

    const newMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(newColor),
      shininess: 10,
    });

    // TODO: should not clone everytime. Better to init one material
    // for each mesh and clone it. This could cause memory leak.
    // let newMaterial;
    // if (useClone) {
    //   newMaterial = materials[Object.keys(materials)[0]].clone();
    //   currentMaterials.current[meshName] = newMaterial;
    // } else {
    //   newMaterial = currentMaterials.current[meshName];
    // }
    // newMaterial.color = new THREE.Color(newColor);

    setMaterialByMeshName(meshName, newMaterial, scene);
  }

  function addAtomizerCanvas(meshName) {

    // Clone existing material to re-apply with canvas
    const newMaterial = materials[Object.keys(materials)[0]].clone();

    const canvasTexture = new THREE.CanvasTexture(canvasRef.current);
    canvasTexture.repeat= new THREE.Vector2(ATOMIZER_CANVAS_COLS, ATOMIZER_CANVAS_ROWS);
    canvasTexture.wrapS = THREE.RepeatWrapping;
    canvasTexture.wrapT = THREE.RepeatWrapping;
    newMaterial.map = canvasTexture;

    textureRef.current = canvasTexture;

    scene.traverse((object) => {
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
    scene.traverse ( function (child) {
        if (child instanceof THREE.Mesh) {
            child.visible = true;
        }
    });
  }, [visible]);

  useEffect(() => {
    const meshTargets = [];
    const topLevelTargets = [];
    scene.traverse((object) => {
      if (object.id !== scene.id) {
        if (object.isMesh || object.isGroup) {
          // Check if direct descendant of main scene
          if (object.parent.id === scene.id) {
            object.displayName = object.name.toUpperCase();
            topLevelTargets.push(object.name);
          }
          meshTargets.push(object.name);
        }
      }
    });

    console.log('@ topLevelTargets', topLevelTargets);
    console.log('@ meshTargets', meshTargets);

    // Add canvas texture to existing material
    topLevelTargets.forEach(meshName => {
      addAtomizerCanvas(meshName);
    });

    // Setting default color of all meshes once on load.
    // meshTargets.forEach(meshName => {
    //   applySwatch(meshName, PRE_GLAZE_DEFAULT_COLOR, true);
    //   currentColors.current[meshName] = PRE_GLAZE_DEFAULT_COLOR;
    // });
  }, []);

  // Apply user-made edits 
  // (usually coming from previous version of model)
  useEffect(() => {
    if (visible && edits) {
      if (edits.colors) {
        Object.keys(edits.colors).forEach(meshName => {
          // applySwatch(meshName, edits.colors[meshName], true);
          currentColors.current[meshName] = edits.colors[meshName];
        });
      }
      if (edits.atomizerPoints) {
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
      object={scene}
      visible={visible}
    /> );
}
