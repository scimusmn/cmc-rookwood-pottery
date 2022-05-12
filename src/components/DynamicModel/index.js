/* eslint-disable */
/* Disabled ESLINT to get around blocking eslint warnings
tied to imports from the three/examples folder. - tn  */
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function DynamicModel({
  modelPath, scale, color, texture,
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
    '/assets/tiger-skull-paint.png',
    '/assets/tiger-skull-eyes.png',
  ]);

  console.log('traversing');
  scene.traverse((o) => {
    if (o.isMesh) {
      console.log('mesh -->', o.name);
      o.displayName = o.name.toUpperCase();
    }
  });

  function applySwatch(meshName, color) {

    const newMaterial = new THREE.MeshPhongMaterial({
      color: parseInt(`0x${color}`),
      shininess: color.shininess ? color.shininess : 10,
    });

    setMaterialByMeshName(meshName, newMaterial, scene);
  }

  function setMaterialByMeshName(meshName, newMaterial, parentScene) {
    parentScene.traverse((object) => {
      if (object.isMesh) {
        console.log('mesh', object.name, meshName);
        if (object.name === meshName) {
          console.log('match');
          object.material = newMaterial;
          return;
        }
      }
    });
  }

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

    if (texture > 0) {
      const newTexture = textures[texture - 1];
      // These next two settings are quirks specific to GLTF + loading external textures.
      // https://threejs.org/docs/#examples/en/loaders/GLTFLoader
      // If texture is used for color information, set colorspace.
      newTexture.encoding = THREE.sRGBEncoding;
      // UVs use the convention that (0, 0) corresponds to the upper left corner of a texture.
      newTexture.flipY = false;
      // newTexture.flipX = false;

      // newTexture.needsUpdate = true;
      const material = materials[Object.keys(materials)[0]];

      // Tell material to use alpha blending
      // material.transparent = true;
      // material.alphaTest = 0.1;

      material.map = newTexture;
      console.log('material.map', material.map);

      material.needsUpdate = true;
      mesh.current.needsUpdate = true;

      // scene.traverse(function (child) {
      //   console.log('traverse', child);
      //   if (child.isMesh && child.geometry) {

      //         let geometry = child.geometry;

      //         console.log('geometry', geometry);

      //         geometry.clearGroups();

      //         geometry.addGroup(0, Infinity, 0);

      //         geometry.addGroup(0, Infinity, 1);

      //         child.material = materials;

      //     }
      // })
    }
  }, [texture]);

  console.log('applySwatch');
  applySwatch('cushions', '44ffcc');
  applySwatch('supports', 'ffccff');
  applySwatch('legs', '991100');
  applySwatch('back', '11ff44');

  const mesh = useRef();
  useFrame(() => {
    // mesh.current.rotation.y += 0.01;
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
    // if (texture) material.map = textures[texture - 1];
  });

  return <primitive object={scene} ref={mesh} scale={scale} position={[0, -1, 0]} />;
}
