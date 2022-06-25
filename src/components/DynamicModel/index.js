/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import COLOR_LOOKUP, { PRE_GLAZE_DEFAULT_COLOR, ERASER_COLOR_ID } from '../../data/ColorLookup';

export function DynamicModel({
  modelPath, 
  scale, 
  targetMesh, 
  activeColor, 
  visible, 
  onMeshTargetsReady, 
  edits, 
  onUserEdits,
  position,
}) {

  console.log('DynamicModel', modelPath);

  const { scene, nodes, materials } = useGLTF(modelPath);

  // We need to use a clone of the scene (mesh) so ThreeJS
  // will allow more than one instance to render in scene.
  const copiedScene = useMemo(() => scene.clone(), [scene]);

  const mesh = useRef();
  const currentColors = useRef({});
  const currentDragColor = useRef(null);
  const dragging = useRef(false);
  const currentMaterials = useRef({});

  function onTouchDown(e) {
    console.log('∂ onTouchDown');
    dragging.current = true;
    onRaycast(e);
    e.stopPropagation();
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

    console.log('onRaycast', dragging.current, currentDragColor.current);
    if (dragging.current === true && currentDragColor.current) {
      applySwatch(object.name, currentDragColor.current);
    }
    
  }

  function onRaycastLeave(e) {
    const {object} = e;

    // Prevents other meshes from returning a hit
    // (we only need the closest mesh)
    e.stopPropagation();

    if (dragging.current === true) {
      // dragging.current = false;
      applySwatch(object.name, currentColors.current[object.name]);
    }
  }

  function applySwatch(meshName, newColor, useClone) {

    console.log('applySwatch', meshName, newColor, useClone);
    
    // Note: color is a string, not a THREE.Color object
    // should be a valid color string (https://threejs.org/docs/#api/en/math/Color.set)
    // e.g. '0x00ff00', 'red', or '#ff0000'

    // const newMaterial = new THREE.MeshPhongMaterial({
    //   color: new THREE.Color(newColor),
    //   shininess: 10,
    // });

    // TODO: should not clone everytime. Better to init one material
    // for each mesh and clone it.
    let newMaterial;
    if (useClone) {
      newMaterial = materials[Object.keys(materials)[0]].clone();
      currentMaterials.current[meshName] = newMaterial;
    } else {
      newMaterial = currentMaterials.current[meshName];
    }
    newMaterial.color = new THREE.Color(newColor);

    setMaterialByMeshName(meshName, newMaterial, copiedScene);
  }

  function setMaterialOfChildren(newMaterial, parentObject) {
    parentObject.traverse((object) => {
      if (object.isMesh) {
        object.material = newMaterial;
      }
    });
  }

  function setMaterialByMeshName(meshName, newMaterial, parentScene) {
    // TODO: this can be replaced with Object3D.getObjectByName()
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
    copiedScene.traverse ( function (child) {
        if (child instanceof THREE.Mesh) {
            child.visible = true;
        }
    });
  }, [visible]);

  useEffect(() => {
    const meshTargets = [];
    const topLevelTargets = [];
    copiedScene.traverse((object) => {
      if (object.id !== copiedScene.id) {
        if (object.isMesh || object.isGroup) {
          // Check if direct descendant of main scene
          if (object.parent.id === copiedScene.id) {
            object.displayName = object.name.toUpperCase();
            topLevelTargets.push(object.name);
          }
          meshTargets.push(object.name);
        }
      }
    });

    console.log('topLevelTargets', topLevelTargets);
    console.log('meshTargets', meshTargets);
    if (onMeshTargetsReady) onMeshTargetsReady(topLevelTargets);

    // Hack to get around bug that pops up
    // after trying to apply swatch first time. 
    // For some reason, setting the swatch once
    // immediately after loading the model prevents
    // the bug from appearing on first swatch selection.
    meshTargets.forEach(meshName => {
      applySwatch(meshName, PRE_GLAZE_DEFAULT_COLOR, true);
      currentColors.current[meshName] = PRE_GLAZE_DEFAULT_COLOR;
    });
  }, []);

  useEffect(() => {
    if (visible && edits && edits.colors) {
      console.log('Applying color edits:', edits);
      Object.keys(edits.colors).forEach(meshName => {
        applySwatch(meshName, edits.colors[meshName], true);
        currentColors.current[meshName] = edits.colors[meshName];
      });
    }
  }, [edits, visible]);

  useEffect(() => {
    // This conditional is no longer used, but keeping 
    // in case we need to use it again. (pre-targeting specific meshes)
    if (targetMesh && activeColor) {
      currentColors.current[targetMesh] = activeColor;
      applySwatch(targetMesh, activeColor);
    } 
    // Set new active color to apply 
    let newColor = activeColor;
    // Eraser exception repaints to default glase color
    if (newColor === ERASER_COLOR_ID) newColor = PRE_GLAZE_DEFAULT_COLOR.before;
    currentDragColor.current = newColor;
    console.log('currentDragColor.current', currentDragColor.current);
  }, [activeColor]);

  return <primitive 
            object={copiedScene} 
            ref={mesh} 
            onPointerDown={visible ? onTouchDown : null}
            onPointerUp={visible ? onTouchUp : null}
            onPointerEnter={visible ? onRaycast : null}
            onPointerLeave={visible ? onRaycastLeave : null}
            scale={scale} 
            position={position || [0, 0, 0]} 
            visible={visible}
          />;
}
