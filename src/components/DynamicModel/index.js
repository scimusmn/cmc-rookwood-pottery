/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function DynamicModel({
  modelPath, scale, targetMesh, color, texture, onMeshTargetsReady,
}) {
  const { scene, nodes, materials } = useGLTF(modelPath);

  console.log('dynamic model', modelPath, scale);
  console.log('scene', scene);
  console.log('nodes', nodes);
  console.log('materials', materials);

  const textures = useTexture([
    '/assets/texture-frog-alt-1.png',
    '/assets/texture-frog-alt-2.png',
    '/assets/texture-frog-alt-3.png',
    '/assets/texture-frog-alt-4.png',
    '/assets/tiger-skull-layer-1.png',
  ]);

  function applySwatch(meshName, newColor) {
    
    // Note: color is a string, not a THREE.Color object
    // should be a valid color string (https://threejs.org/docs/#api/en/math/Color.set)
    // e.g. '0x00ff00', 'red', or '#ff0000'
    const newMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(newColor),
      shininess: 10,
    });

    setMaterialByMeshName(meshName, newMaterial, scene);
  }

  function setMaterialOfChildren(newMaterial, parentObject) {
    parentObject.traverse((object) => {
      if (object.isMesh) {
        console.log("Swapping material for CHILD mesh '" + object.name + "'");
        object.material = newMaterial;
      }
    });
  }

  function setMaterialByMeshName(meshName, newMaterial, parentScene) {
    // TODO: this can be replaced with Object3D.getObjectByName()
    // https://threejs.org/docs/#api/en/core/Object3D.getObjectByName
    parentScene.traverse((object) => {
      if (object.isMesh && object.name === meshName) {
        console.log("Swapping material for mesh '" + object.name + "'");
        object.material = newMaterial;
        return;
      } else if (object.isGroup && object.name === meshName) {
        console.log('forwarding to group: ' + object.name);
        setMaterialOfChildren(newMaterial, object);
      }
    });
  }

  useEffect(() => {
    console.log("INIT EFFECT");

    console.log('Listing mesh names:');
    const meshTargets = [];
    const topLevelTargets = [];
    scene.traverse((object) => {
      console.log('obj -->', object);
      if (object.id !== scene.id) {
        if (object.isMesh || object.isGroup) {
          console.log('mesh/group -->', object.name);
          // Check if direct descendant of main scene
          if (object.parent.id === scene.id) {
            console.log('* direct descendant');
            object.displayName = object.name.toUpperCase();
            topLevelTargets.push(object.name);
          }
          meshTargets.push(object.name);
        }
      }
    });

    console.log('topLevelTargets', topLevelTargets);
    console.log('meshTargets', meshTargets);
    onMeshTargetsReady(topLevelTargets);

    // Hack to get around bug that pops up
    // after trying to apply swatch first time. 
    // For some reason, setting the swatch once
    // immediately after loading the model prevents
    // the bug from appearing on first swatch selection.
    meshTargets.forEach(meshName => {
      applySwatch(meshName, 'gray');
    });


  }, []);

  useEffect(() => {
    console.log('targetMesh', targetMesh, color);
    if (targetMesh && color) {
      console.log('applying color');
      applySwatch(targetMesh, color);
    }
  }, [color]);

  // useEffect(() => {
  //   console.log('color', color);
  //   if (color && color !== 'spin') {
  //     const material = materials[Object.keys(materials)[0]];
  //     material.color.r = color.r;
  //     material.color.g = color.g;
  //     material.color.b = color.b;
  //   }
  // }, [color]);

  useEffect(() => {
    console.log('texture', texture);

    if (texture > 0) {
      const newTexture = textures[texture - 1];
      // These next two settings are quirks specific to GLTF + loading external textures.
      // https://threejs.org/docs/#examples/en/loaders/GLTFLoader
      // If texture is used for color information, set colorspace.
      newTexture.encoding = THREE.sRGBEncoding;
      // UVs use the convention that (0, 0) corresponds to the upper left corner of a texture.
      newTexture.flipY = false;

      // newTexture.needsUpdate = true;
      const material = materials[Object.keys(materials)[0]];

      // Tell material to use alpha blending
      // material.transparent = true;
      // material.alphaTest = 0.1;

      material.map = newTexture;
      console.log('material.map', material.map);

      material.needsUpdate = true;
      mesh.current.needsUpdate = true;

    }
  }, [texture]);

  const mesh = useRef();
  useFrame(() => {
    // mesh.current.rotation.y += 0.01;
    const material = materials[Object.keys(materials)[0]];
    if (color && color === 'spin') {
      material.color.r = 0.5 + Math.sin(Date.now() * 0.001) * 0.5;
      material.color.g = 0.1 + Math.sin(Date.now() * 0.001) * 0.5;
      material.color.b = 0.3 + Math.sin(Date.now() * 0.002) * 0.5;
    }
    // material.map = texture;
    // if (texture) material.map = textures[texture - 1];
  });

  return <primitive object={scene} ref={mesh} scale={scale} position={[0, -1.5, 0]} />;
}
