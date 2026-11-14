import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D Steam Particles Component
 * Safely generates wisps of rising aromatic steam above the hot dish.
 */
const FoodSteam = ({ count = 16 }) => {
  const pointsRef = useRef();

  const [geometry, speeds] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 1] = 0.2 + Math.random() * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      sp[i] = 0.3 + Math.random() * 0.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return [geo, sp];
  }, [count]);

  useFrame((_state, delta) => {
    if (!pointsRef.current || !pointsRef.current.geometry) return;
    const posAttr = pointsRef.current.geometry.attributes?.position;
    if (!posAttr || !posAttr.array) return;

    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3 + 1] += speeds[i] * delta;
      posAttr.array[i * 3 + 0] += Math.sin(posAttr.array[i * 3 + 1] * 2) * 0.003;
      if (posAttr.array[i * 3 + 1] > 1.8) {
        posAttr.array[i * 3 + 1] = 0.2;
        posAttr.array[i * 3 + 0] = (Math.random() - 0.5) * 1.1;
        posAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.16}
        color="#FFFFFF"
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/**
 * 3D Roasted Lemon Wedge
 */
const LemonWedge = ({ position, rotation, scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#EAB308" roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.035, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#84CC16" roughness={0.4} />
      </mesh>
    </group>
  );
};

/**
 * 3D Fresh Mint Leaf
 */
const MintLeaf = ({ position, rotation, scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial
          color="#15803D"
          roughness={0.45}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
        <meshStandardMaterial color="#86EFAC" roughness={0.5} />
      </mesh>
    </group>
  );
};

/**
 * 3D Roasted Cashew Nut
 */
const CashewNut = ({ position, rotation, scale = 1 }) => {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <torusGeometry args={[0.12, 0.055, 10, 16, Math.PI * 1.3]} />
      <meshStandardMaterial color="#E5B26E" roughness={0.5} metalness={0.15} />
    </mesh>
  );
};

/**
 * FoodModel - 3D Realistic Food Plate Component
 */
export const FoodModel = ({ dish }) => {
  const texture = useMemo(() => {
    const defaultLocalImg = '/assets/images/biryani_bowl_nobg.png';
    const imgUrl = dish?.image || defaultLocalImg;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const tex = loader.load(
      imgUrl,
      undefined,
      undefined,
      () => {
        // Fallback to local image if remote fails
        loader.load(defaultLocalImg, (fallbackTex) => {
          fallbackTex.colorSpace = THREE.SRGBColorSpace;
          tex.image = fallbackTex.image;
          tex.needsUpdate = true;
        });
      }
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return tex;
  }, [dish?.image]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. 3D Ceramic Restaurant Platter Base */}
      <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.3, 0.14, 48]} />
        <meshStandardMaterial
          color="#18181B"
          roughness={0.35}
          metalness={0.2}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* 2. Plate Sloped Outer Basin Wall */}
      <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.92, 1.5, 0.16, 48, 1, true]} />
        <meshStandardMaterial
          color="#18181B"
          roughness={0.35}
          metalness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Decorative Warm Brass Rim Ring */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.92, 0.038, 16, 64]} />
        <meshStandardMaterial
          color="#D97706"
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>

      {/* 4. Raised Food Surface with Authentic Texture */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.86, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.5}
          metalness={0.1}
          bumpScale={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5. Inner Warm Amber Glow Ring */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 1.84, 48]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 6. Realistic 3D Garnishes */}
      <LemonWedge position={[-0.85, 0.06, -0.6]} rotation={[0.2, 0.8, -0.15]} scale={0.9} />
      <LemonWedge position={[0.9, 0.06, 0.55]} rotation={[-0.15, -1.2, 0.1]} scale={0.85} />

      <MintLeaf position={[-0.05, 0.08, -0.05]} rotation={[0.4, 0.2, 0.1]} scale={1.1} />
      <MintLeaf position={[0.12, 0.09, 0.08]} rotation={[0.2, -0.5, -0.2]} scale={0.95} />
      <MintLeaf position={[-0.14, 0.08, 0.1]} rotation={[-0.3, 0.7, 0.3]} scale={0.85} />

      <CashewNut position={[-0.65, 0.05, 0.55]} rotation={[0.3, 0.4, 0.2]} scale={0.9} />
      <CashewNut position={[0.7, 0.05, -0.6]} rotation={[-0.2, 1.1, -0.4]} scale={0.85} />

      {/* 7. Rising Steam Particles */}
      <FoodSteam count={16} />
    </group>
  );
};

export default FoodModel;
