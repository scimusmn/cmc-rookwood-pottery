/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

function LoadableOBJ({ objPath, mtlPath, scale }) {
  const modelExtension = objPath.split('.').pop();
  console.log('objPath', objPath, modelExtension);

  let loadedObject;
  // Currently only supports .obj and .gltf
  if (modelExtension === 'obj') {
    const materials = useLoader(MTLLoader, mtlPath);
    loadedObject = useLoader(OBJLoader, objPath, (loader) => {
      materials.preload();
      loader.setMaterials(materials);
    });
  } else if (modelExtension === 'gltf') {
    const gltf = useLoader(GLTFLoader, objPath);
    loadedObject = gltf.scene;
  }

  const mesh = useRef();
  useFrame(() => {
    mesh.current.rotation.y += 0.01;
  });

  return <primitive object={loadedObject} ref={mesh} scale={scale} position={[0, -1, 0]} />;
}

export default LoadableOBJ;
