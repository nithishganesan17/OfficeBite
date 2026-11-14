import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ScrollRotation - R3F Component
 * Smoothly interpolates the 3D food plate rotation based on window scroll progress.
 * Adds gentle floating dynamics and tilt for realistic food presentation.
 */
export const ScrollRotation = ({ children, extraRotationY = 0, speed = 0.003 }) => {
  const groupRef = useRef();
  const scrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Target rotation derived from scroll position plus any interactive swipe rotation offset
    const targetY = scrollYRef.current * speed + extraRotationY;

    // Damped interpolation for silky smooth rotation
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY,
      5,
      delta
    );

    // Subtle natural culinary tilt and floating bob
    const floatBob = Math.sin(state.clock.elapsedTime * 1.6) * 0.035;
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      floatBob,
      4,
      delta
    );

    // Realistic culinary viewing angle (~22 degrees tilt towards camera)
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      0.38 + Math.sin(state.clock.elapsedTime * 1.2) * 0.015,
      3,
      delta
    );
  });

  return <group ref={groupRef}>{children}</group>;
};

export default ScrollRotation;

