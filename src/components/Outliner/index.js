/* eslint-disable */

import React, {
  useRef, useEffect, useMemo, useState,
} from 'react';
import { Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

extend({ EffectComposer, RenderPass, OutlinePass, ShaderPass });

import { useFrame, useLoader, extend, useThree } from '@react-three/fiber';

const context = React.createContext();
function Outliner({ children }) {
  const {
    gl, scene, camera, size,
  } = useThree();
  const composer = useRef();
  const [hovered, set] = useState([]);
  const aspect = useMemo(() => new Vector2(size.width, size.height), [size]);
  useEffect(() => composer.current.setSize(size.width, size.height), [size]);
  useFrame(() => composer.current.render(), 1);
  return (
    <context.Provider value={set}>
      {children}
      <EffectComposer ref={composer} args={[gl]}>
        {/* <RenderPass attachArray="passes" args={[scene, camera]} /> */}
        <OutlinePass
          attachArray="passes"
          args={[aspect, scene, camera]}
          selectedObjects={hovered}
          visibleEdgeColor="white"
          edgeStrength={50}
          edgeThickness={1}
        />
        {/* <ShaderPass attachArray="passes" args={[FXAAShader]} uniforms-resolution-value={[1 / size.width, 1 / size.height]} /> */}
      </EffectComposer>
    </context.Provider>
  );
}

export default Outliner;
