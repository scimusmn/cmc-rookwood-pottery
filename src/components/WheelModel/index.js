/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function WheelModel({
  modelPath, 
  visible,
}) {
  const { scene, nodes, materials } = useGLTF(modelPath);

  const mesh = useRef();

  useEffect(() => {
    console.log('wheel visible', visible);
    scene.traverse ( function (child) {
        if (child instanceof THREE.Mesh) {
            child.visible = visible;
        }
    });
  }, [visible]);

  return <primitive 
            object={scene} 
            ref={mesh} 
            scale={0.01} 
            position={[0, 0, 0]} 
          />;
}
