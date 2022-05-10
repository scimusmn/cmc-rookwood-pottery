/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { useGLTF } from '@react-three/drei';
// import { useOBJ } from '@react-three/drei';

function LoadableModel({ modelPath, mtlPath, scale }) {
  const modelExtension = modelPath.split('.').pop();
  console.log('modelPath', modelPath, modelExtension);

  let loadedObject;
  // Currently supports .obj and .gltf
  if (modelExtension === 'obj') {
    const materials = useLoader(MTLLoader, mtlPath);
    loadedObject = useLoader(OBJLoader, modelPath, (loader) => {
      materials.preload();
      loader.setMaterials(materials);
    });
  } else if (modelExtension === 'gltf') {
    const gltf = useGLTF(modelPath);
    loadedObject = gltf.scene;
  } else {
    console.error('Unsupported model extension:', modelExtension);
  }

  const mesh = useRef();
  useFrame(() => {
    mesh.current.rotation.y += 0.01;
  });

  return <primitive object={loadedObject} ref={mesh} scale={scale} position={[0, -1, 0]} />;
}

export default LoadableModel;
