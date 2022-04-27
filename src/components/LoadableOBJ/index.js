/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

function LoadableOBJ({ objPath, mtlPath, scale }) {
  const materials = useLoader(MTLLoader, mtlPath);
  const obj = useLoader(OBJLoader, objPath, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  const mesh = useRef();
  useFrame(() => {
    mesh.current.rotation.y += 0.01;
  });

  console.log(obj);
  return <primitive object={obj} ref={mesh} scale={scale} position={[0, -1, 0]} />;
}

export default LoadableOBJ;
