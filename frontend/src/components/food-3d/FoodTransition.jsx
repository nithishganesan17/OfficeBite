import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FoodModel } from './FoodModel';
import { ScrollRotation } from './ScrollRotation';

/**
 * FoodTransition - 3D Plate Transition Component
 * Handles the horizontal slide, 3D spin-out and spin-in animations when switching between dishes.
 */
export const FoodTransition = ({
  currentDish,
  incomingDish,
  isTransitioning,
  transitionProgress, // 0 -> 1
  direction = 'next', // 'next' (swipe left) | 'prev' (swipe right)
}) => {
  const currentGroupRef = useRef();
  const incomingGroupRef = useRef();

  useFrame((_state, delta) => {
    const dirFactor = direction === 'next' ? 1 : -1;

    if (isTransitioning) {
      const p = transitionProgress; // 0 to 1

      // 1. Current plate slides out and spins away
      if (currentGroupRef.current) {
        currentGroupRef.current.position.x = -dirFactor * p * 4.0;
        currentGroupRef.current.rotation.y = -dirFactor * p * Math.PI * 1.2;
        currentGroupRef.current.scale.setScalar(Math.max(0.65, 1 - p * 0.3));
      }

      // 2. Incoming plate slides in from opposite side and spins into center
      if (incomingGroupRef.current && incomingDish) {
        incomingGroupRef.current.position.x = dirFactor * (1 - p) * 4.0;
        incomingGroupRef.current.rotation.y = dirFactor * (1 - p) * Math.PI * 1.2;
        incomingGroupRef.current.scale.setScalar(0.7 + p * 0.3);
      }
    } else {
      // Idle state: snap cleanly to center
      if (currentGroupRef.current) {
        currentGroupRef.current.position.x = 0;
        currentGroupRef.current.rotation.y = THREE.MathUtils.damp(
          currentGroupRef.current.rotation.y,
          0,
          8,
          delta
        );
        currentGroupRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group>
      {/* Current Active Dish with Scroll-driven rotation */}
      <group ref={currentGroupRef}>
        <ScrollRotation>
          <FoodModel dish={currentDish} />
        </ScrollRotation>
      </group>

      {/* Incoming Dish during transition */}
      {isTransitioning && incomingDish && (
        <group ref={incomingGroupRef}>
          <ScrollRotation>
            <FoodModel dish={incomingDish} />
          </ScrollRotation>
        </group>
      )}
    </group>
  );
};

export default FoodTransition;

