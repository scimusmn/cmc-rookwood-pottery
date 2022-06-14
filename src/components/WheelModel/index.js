/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function WheelModel({
  modelPath, 
}) {
  console.log('WheelModel', modelPath);
  const { scene, nodes, materials } = useGLTF(modelPath);

  const mesh = useRef();
  const currentColors = useRef({});
  const currentDragColor = useRef(null);
  const dragging = useRef(false);
  const currentMaterials = useRef({});

  return <primitive 
            object={scene} 
            ref={mesh} 
            scale={0.1} 
            position={[0, 0, 0]} 
          />;
}
