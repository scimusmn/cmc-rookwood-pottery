/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei'; 
  
 export const DynamicModel = ({modelPath, scale, color, texture}) => { 
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
    ]);

    useEffect(() => {
      console.log('color', color);
      if (color && color !== 'spin') {
        const material = materials[Object.keys(materials)[0]];
        material.color.r = color.r;
        material.color.g = color.g;
        material.color.b = color.b;
      }
    }, [color]);

    useEffect(() => {
      console.log('texture', texture);
      const material = materials[Object.keys(materials)[0]];
      if (texture > 0) material.map = textures[texture - 1];
    }, [texture]);


   const mesh = useRef();
    useFrame(() => {
      mesh.current.rotation.y += 0.01;
      const material = materials[Object.keys(materials)[0]];
      // material.color.r = 0.5 + Math.sin(Date.now() * 0.001) * 0.5;
      // material.color.g = 0.1 + Math.sin(Date.now() * 0.001) * 0.5;
      if (color && color === 'spin') {
        material.color.r = 0.5 + Math.sin(Date.now() * 0.001) * 0.5;
        material.color.g = 0.1 + Math.sin(Date.now() * 0.001) * 0.5;
        material.color.b = 0.3 + Math.sin(Date.now() * 0.002) * 0.5;
      }
      // console.log(mesh.current.rotation.y);
        // material.map = texture;
      if (texture) material.map = textures[texture - 1];
    });
    
   return <primitive object={scene} ref={mesh} scale={scale} position={[0, -1, 0]} /> 
 }; 


