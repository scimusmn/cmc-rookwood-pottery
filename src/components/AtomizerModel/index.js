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
  scale, 
  activeColor, 
  visible, 
  edits, 
  onUserEdits,
}) {

  console.log('AtomizerModel', modelPath);

  const [allowControls, setAllowControls] = useState(true);
  const [cols, setCols] = useState(5);
  const [rows, setRows] = useState(5);

  const canvasRef = useRef(document.createElement("canvas"));
  const textureRef = useRef(null);

  const { scene, nodes, materials } = useGLTF(modelPath);

  const mesh = useRef();
  const currentColors = useRef({});
  const currentDragColor = useRef(null);
  const dragging = useRef(false);
  const currentMaterials = useRef({});

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext("2d");
    if (context) {
      context.rect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.fill();
    }
  }, []);

  function sprayAtomizer({uv}) {
    if (!dragging.current) {
      return;
    }
    if (uv) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      console.log("uv spray point:", uv.x, uv.y);

      // De-normalize to canvas dimensions
      let x = uv.x * canvas.width;
      let y = (1 - uv.y) * canvas.height;

      console.log("xy canvas:", x, y);

      // Shift to paint on "real" texture tile (to be repeated)
      x *= cols;
      y *= rows;

      // Shift to paint on "real" texture tile (to be repeated)
      x = x % canvas.width;
      y = y % canvas.height;

      console.log("xy untiled:", x, y);

      const splatRadius = 50;

      if (context) {

        // SPLAT DOTS
        context.beginPath();
        context.arc(
          x,
          y,
          splatRadius,
          0,
          2 * Math.PI
        );
        context.fillStyle = "rgba(255, 25, 0, 0.5)";
        context.fill();

        // HORIZONTAL LINE
        // context.lineWidth = 3;
        // context.strokeStyle = "rgba(255, 25, 0, 0.5)";
        // // context.strokeStyle = currentDragColor.current;
        // context.beginPath();
        // context.moveTo(0, y);
        // context.lineTo(canvas.width, y);
        // context.stroke();

        textureRef.current.needsUpdate = true;

      }

    }
  }

  function onTouchDown(e) {
    dragging.current = true;
    sprayAtomizer(e);
    e.stopPropagation();
    // onRaycast(e);
  }

  function onTouchUp(e) {
    dragging.current = false;
    e.stopPropagation();
    const {object} = e;
    // This color is now "permanent"
    currentColors.current[object.name] = activeColor;
    if (onUserEdits) onUserEdits({colors: currentColors.current});
  }

  function onRaycast(e) {
    const {object} = e;

    // Prevents other meshes from returning a hit
    // (we only need the closest mesh)
    e.stopPropagation();

    if (dragging.current === true && currentDragColor.current) {
      // applySwatch(object.name, currentDragColor.current);
    }
    
  }

  function onRaycastLeave(e) {
    const {object} = e;

    // Prevents other meshes from returning a hit
    // (we only need the closest mesh)
    e.stopPropagation();

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

    console.log('addAtomizerCanvas==',  canvasRef.current);


    // const canvas = canvasRef.current;
    // const context = canvas.getContext("2d");
    // context.beginPath();
    // context.arc(
    //   100,
    //   100,
    //   100,
    //   0,
    //   2 * Math.PI
    // );
    // context.fillStyle = "rgba(255, 25, 0, 0.5)";
    // context.fill();

    const canvasTexture = new THREE.CanvasTexture(canvasRef.current);
    canvasTexture.repeat= new THREE.Vector2(cols, rows);
    canvasTexture.wrapS = THREE.RepeatWrapping;
    canvasTexture.wrapT = THREE.RepeatWrapping;
    newMaterial.map = canvasTexture;

    textureRef.current = canvasTexture;
    
  //   <canvasTexture
  //   ref={textureRef}
  //   attach="map"
  //   image={canvasRef.current}
  //   repeat={new THREE.Vector2(cols, rows)}
  //   wrapS={THREE.RepeatWrapping}
  //   wrapT={THREE.RepeatWrapping}
  // />

    //
    // CanvasTexture( canvas : HTMLElement, mapping : Constant, wrapS : Constant, wrapT : Constant, magFilter : Constant, minFilter : Constant, format : Constant, type : Constant, anisotropy : Number )
    //

    // newMaterial.color = new THREE.Color(newColor);

    scene.traverse((object) => {
      console.log('cnv traverse', object.name);
      if (object.isMesh && object.name === meshName) {
        console.log('adding canvas to', meshName);
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
    if (visible && edits && edits.colors) {
      Object.keys(edits.colors).forEach(meshName => {
        // applySwatch(meshName, edits.colors[meshName], true);
        currentColors.current[meshName] = edits.colors[meshName];
      });
    }
  }, [edits, visible]);

  useEffect(() => {
    // Set new active color to apply 
    let newColor = activeColor;
    // Eraser exception repaints to default glase color
    if (newColor === ERASER_COLOR_ID) newColor = PRE_GLAZE_DEFAULT_COLOR.before;
    currentDragColor.current = newColor;
  }, [activeColor]);

  return (
    <primitive
      onPointerDown={visible ? onTouchDown : null}
      object={scene}
    /> );

  // return <primitive 
  //           object={scene} 
  //           ref={mesh} 
  //           onPointerDown={visible ? onTouchDown : null}
  //           onPointerUp={visible ? onTouchUp : null}
  //           onPointerEnter={visible ? onRaycast : null}
  //           onPointerLeave={visible ? onRaycastLeave : null}
  //           scale={scale} 
  //           position={[0, 0, 0]} 
  //           visible={visible}
  //         />;

  // return <primitive 
  //           object={scene} 
  //           ref={mesh} 
  //           onPointerDown={visible ? onTouchDown : null}
  //           onPointerUp={visible ? onTouchUp : null}
  //           onPointerEnter={visible ? onRaycast : null}
  //           onPointerLeave={visible ? onRaycastLeave : null}
  //           scale={scale} 
  //           position={[0, 0, 0]} 
  //           visible={visible}
  //         >
  //           <meshStandardMaterial attach="material" metalness={0} roughness={1}>
  //           <canvasTexture
  //             ref={textureRef}
  //             attach="map"
  //             image={canvasRef.current}
  //             repeat={new THREE.Vector2(cols, rows)}
  //             wrapS={THREE.RepeatWrapping}
  //             wrapT={THREE.RepeatWrapping}
  //           />
  //           </meshStandardMaterial>
  //         </primitive>;
}
