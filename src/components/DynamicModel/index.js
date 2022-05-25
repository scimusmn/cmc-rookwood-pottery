/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function DynamicModel({
  modelPath, scale, targetMesh, color, visible, onMeshTargetsReady, edits, onUserEdits,
}) {
  const { scene, nodes, materials } = useGLTF(modelPath);

  // console.log('dynamic model', modelPath, scale);
  // console.log('scene', scene);
  // console.log('nodes', nodes);
  // console.log('materials', materials);
  // console.log('listing material names:', Object.keys(materials));

  const mesh = useRef();
  const currentColors = useRef({});
  const currentDragColor = useRef(null);
  const dragging = useRef(false);
  const currentMaterials = useRef({});

  function onTouchDown(e) {
    dragging.current = true;
    e.stopPropagation();
    onRaycast(e);
  }

  function onTouchUp(e) {
    dragging.current = false;
    e.stopPropagation();
    const {object} = e;
    // This color is now "permanent"
    currentColors.current[object.name] = color;
    if (onUserEdits) onUserEdits({colors: currentColors.current});
  }

  function onRaycast(e) {
    // console.log('onRaycast', e);
    const {object} = e;

    // Prevents other meshes from returning a hit
    // (we only need the closest mesh)
    e.stopPropagation();

    // applySwatch(object.name, 'white');
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

    setMaterialByMeshName(meshName, newMaterial, scene);
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

    console.log('topLevelTargets', topLevelTargets);
    console.log('meshTargets', meshTargets);
    if (onMeshTargetsReady) onMeshTargetsReady(topLevelTargets);

    // Hack to get around bug that pops up
    // after trying to apply swatch first time. 
    // For some reason, setting the swatch once
    // immediately after loading the model prevents
    // the bug from appearing on first swatch selection.
    const defaultColor = 'gray';
    meshTargets.forEach(meshName => {
      applySwatch(meshName, defaultColor, true);
      currentColors.current[meshName] = defaultColor;
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
    if (targetMesh && color) {
      currentColors.current[targetMesh] = color;
      applySwatch(targetMesh, color);
    } 
    currentDragColor.current = color;
  }, [color]);

  return <primitive 
            object={scene} 
            ref={mesh} 
            onPointerDown={onTouchDown}
            onPointerUp={onTouchUp}
            onPointerEnter={onRaycast} 
            onPointerLeave={onRaycastLeave} 
            scale={scale} 
            position={[0, -1.5, 0]} 
            visible={visible}
          />;
}
