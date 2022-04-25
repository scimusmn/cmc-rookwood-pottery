import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import LoadableOBJ from '../components/LoadableOBJ';

// const objPath = '/static/98cd1dea958584e08cc29e7271bab242/Mia_012963_WaterBuffalo_OBJ.obj';

// const objPath = '/assets/water-buffalo/Mia_012963_WaterBuffalo_OBJ.obj';
// const mtlPath = '/assets/water-buffalo/Mia_012963_WaterBuffalo_OBJ.mtl';

// const objPath = '/assets/example/Poimandres.obj';
const mtlPath = '/assets/example/Poimandres.mtl';

const objPath = '/assets/cat/cat.obj';

const models = [
  {name:'Cat', objPath:'/assets/cat/cat.obj', mtlPath: '/assets/example/Poimandres.mtl'},
  {name:'Frog', objPath:'/assets/frog/Frog_LOD0.obj', mtlPath: '/assets/example/Poimandres.mtl'},
  // {name:'Mia', objPath:'/assets/mia/Mia_012963_WaterBuffalo_OBJ.obj', mtlPath: '/assets/mia/Mia_012963_WaterBuffalo_OBJ.mtl'},
];

// const objPath = '/assets/frog/Frog_LOD0.obj';

function Box(props) {
  // This reference will give us direct access to the mesh so we can animate it
  const mesh = useRef();

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  // eslint-disable-next-line
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));

  return (
    <mesh
    // eslint-disable-next-line
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        color={hovered ? 'hotpink' : 'orange'}
      />
    </mesh>
  );
}

function IndexPage() {
  return (
    <div style={{ position: "relative", width: 900, height: 900 }}>
    <Canvas>
      <Suspense fallback={null}>
        <LoadableOBJ objPath={objPath} mtlPath={mtlPath} scale={3} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        
      </Suspense>
    </Canvas>
    </div>
  );
}

export default IndexPage;
