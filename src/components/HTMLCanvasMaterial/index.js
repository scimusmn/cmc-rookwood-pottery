/* eslint-disable react/prop-types */
import React from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

function HTMLCanvasMaterial({ canvas }) {
  const { gl } = useThree();
  const texture = new THREE.CanvasTexture(canvas.current.state.canvas);
  texture.anisotropy = gl.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  texture.flipY = true;
  texture.flipX = false;
  useFrame(() => {
    if (texture) {
      texture.needsUpdate = true;
    }
  });

  return (
    <MeshDistortMaterial
      color="#FFFFFF"
      attach="material"
      distort={0} // Strength, 0 disables the effect (default=1)
      speed={1} // Speed (default=1)
      roughness={9}
      reflectivity={0.9}
      refractionRatio={0.1}
      transparent
      map={texture}
      side={THREE.DoubleSide}
      shininess={1000}
      depthTest
    />
  );
}

export default HTMLCanvasMaterial;
