import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FoodTransition } from './FoodTransition';
import { ErrorBoundary } from '../common/ErrorBoundary';

const DEFAULT_DISH = {
  id: 'biryani-hero-default',
  name: 'Royal Chicken Dum Biryani',
  description: 'Slow-dum cooked aged basmati rice layered with succulent spiced chicken drumsticks, saffron, caramelized onions, and garden-fresh mint leaves.',
  price: 195,
  rating: 4.9,
  prepTime: '15 mins',
  image: '/assets/images/biryani_bowl_nobg.png',
};

/**
 * Check if WebGL is supported in the current browser environment.
 */
const checkWebGLAvailability = () => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

/**
 * 2D Interactive Food Plate Fallback
 * Rendered when WebGL is unavailable or when 3D initialization fails.
 * Features:
 * - High-detail open food plate (no frame / border)
 * - Smooth scroll-driven rotation matching the reference design
 * - Scattered culinary ingredients (sea salt, black peppercorn, garlic, onion, rosemary)
 * - Interactive swipe gestures (mobile touch + desktop mouse drag)
 * - Next / Prev chevron navigation and dot indicators
 */
export const FoodPlateFallback2D = ({
  dishes = [],
  activeDishIndex = 0,
  onDishChange,
}) => {
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const currentDish = dishes[activeDishIndex] || dishes[0] || DEFAULT_DISH;
  const foodImage = currentDish.image || '/assets/images/biryani_bowl_nobg.png';

  const handleNext = useCallback(() => {
    if (!dishes.length) return;
    const nextIdx = (activeDishIndex + 1) % dishes.length;
    onDishChange?.(nextIdx);
  }, [activeDishIndex, dishes.length, onDishChange]);

  const handlePrev = useCallback(() => {
    if (!dishes.length) return;
    const prevIdx = (activeDishIndex - 1 + dishes.length) % dishes.length;
    onDishChange?.(prevIdx);
  }, [activeDishIndex, dishes.length, onDishChange]);

  const handleTouchStart = (e) => {
    if (e.touches.length > 0) {
      dragStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    if (!dragStartX.current) return;
    const endX = e.changedTouches[0]?.clientX || dragStartX.current;
    const diff = dragStartX.current - endX;
    if (diff > 45) handleNext();
    else if (diff < -45) handlePrev();
    dragStartX.current = 0;
  };

  const handleMouseDown = (e) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    const diff = dragStartX.current - e.clientX;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    isDragging.current = false;
    dragStartX.current = 0;
  };

  return (
    <div
      className="relative w-full max-w-[500px] sm:max-w-[560px] lg:max-w-[620px] aspect-square flex items-center justify-center select-none mx-auto cursor-grab active:cursor-grabbing group overflow-visible"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      title="Swipe left or right to switch dishes"
    >
      {/* Soft warm underglow behind food */}
      <div className="absolute inset-8 bg-gradient-to-tr from-[#F59E0B]/16 via-[#D97706]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Scattered Realistic Ingredients */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
        {/* White sea salt crystals */}
        <span className="absolute top-12 right-1/4 w-1.5 h-1.5 bg-white/90 rounded-xs rotate-12 blur-[0.2px]" />
        <span className="absolute top-16 right-1/5 w-2 h-1.5 bg-white/95 rounded-xs rotate-45" />
        <span className="absolute top-24 right-[16%] w-1.5 h-1 bg-white/80 rounded-full" />
        <span className="absolute bottom-28 left-[18%] w-1.5 h-1.5 bg-white/85 rounded-xs -rotate-25" />

        {/* Black peppercorn grains */}
        <span className="absolute top-14 right-[25%] w-2 h-2 bg-[#1C1917] border border-white/20 rounded-full" />
        <span className="absolute bottom-24 left-[24%] w-2 h-2 bg-[#1C1917] border border-white/20 rounded-full" />
        <span className="absolute bottom-20 left-[28%] w-1.5 h-1.5 bg-[#1C1917] border border-white/20 rounded-full" />

        {/* Sliced red onion ring */}
        <div className="absolute top-16 left-[22%] w-10 h-10 rounded-full border-[3px] border-[#BE185D]/75 rotate-45 shadow-sm opacity-90" />

        {/* Roasted garlic clove */}
        <div className="absolute top-8 left-[36%] w-4 h-6 bg-[#FEF3C7] rounded-full rotate-25 shadow-sm opacity-90" />

        {/* Cherry tomato half */}
        <div className="absolute bottom-12 left-[30%] w-7 h-7 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#EF4444] shadow-md flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7F1D1D] opacity-60" />
        </div>
      </div>

      {/* Food Plate Image - Stable Presentation (No Scroll Rotation) */}
      <div
        className="relative z-20 w-[84%] h-[84%] flex items-center justify-center will-change-transform"
      >
        <img
          src={foodImage}
          alt={currentDish.name}
          className="w-full h-full object-contain filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)] drop-shadow-[0_4px_15px_rgba(245,158,11,0.18)]"
          draggable={false}
          onError={(e) => {
            e.currentTarget.src = '/assets/images/biryani_bowl_nobg.png';
          }}
        />
      </div>

      {/* Navigation Controls */}
      {dishes.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:-left-3 p-2.5 rounded-full bg-[#181818]/85 hover:bg-[#F59E0B] text-white hover:text-[#121212] border border-white/10 hover:border-[#F59E0B] shadow-xl backdrop-blur-md transition-all cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95 z-30"
            title="Previous Dish"
            aria-label="Previous Dish"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:-right-3 p-2.5 rounded-full bg-[#181818]/85 hover:bg-[#F59E0B] text-white hover:text-[#121212] border border-white/10 hover:border-[#F59E0B] shadow-xl backdrop-blur-md transition-all cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95 z-30"
            title="Next Dish"
            aria-label="Next Dish"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
            {dishes.map((d, idx) => (
              <button
                key={d.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDishChange?.(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${idx === activeDishIndex
                    ? 'w-7 bg-[#F59E0B]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                title={d.name}
                aria-label={`Select ${d.name}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * 3D Food Plate Canvas Component
 */
const FoodPlate3DCanvas = ({
  dishes,
  activeDishIndex,
  onDishChange,
  currentDish,
}) => {
  const [incomingDishIndex, setIncomingDishIndex] = useState(null);
  const [transitionState, setTransitionState] = useState({
    isTransitioning: false,
    direction: 'next',
    progress: 0,
  });

  const isTransitioningRef = useRef(false);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const triggerTransition = useCallback(
    (targetIndex, direction = 'next') => {
      if (isTransitioningRef.current || targetIndex === activeDishIndex) return;
      isTransitioningRef.current = true;
      setIncomingDishIndex(targetIndex);
      setTransitionState({
        isTransitioning: true,
        direction,
        progress: 0,
      });

      const startTime = performance.now();
      const duration = 550;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const p = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - p, 3);

        setTransitionState({
          isTransitioning: true,
          direction,
          progress: eased,
        });

        if (p < 1) {
          requestAnimationFrame(animate);
        } else {
          onDishChange?.(targetIndex);
          setIncomingDishIndex(null);
          setTransitionState({
            isTransitioning: false,
            direction,
            progress: 0,
          });
          isTransitioningRef.current = false;
        }
      };

      requestAnimationFrame(animate);
    },
    [activeDishIndex, onDishChange]
  );

  const handleNext = useCallback(() => {
    if (!dishes.length) return;
    const nextIdx = (activeDishIndex + 1) % dishes.length;
    triggerTransition(nextIdx, 'next');
  }, [activeDishIndex, dishes.length, triggerTransition]);

  const handlePrev = useCallback(() => {
    if (!dishes.length) return;
    const prevIdx = (activeDishIndex - 1 + dishes.length) % dishes.length;
    triggerTransition(prevIdx, 'prev');
  }, [activeDishIndex, dishes.length, triggerTransition]);

  const handleTouchStart = (e) => {
    if (e.touches.length > 0) {
      dragStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    if (!dragStartX.current || isTransitioningRef.current) return;
    const endX = e.changedTouches[0]?.clientX || dragStartX.current;
    const diff = dragStartX.current - endX;
    if (diff > 45) handleNext();
    else if (diff < -45) handlePrev();
    dragStartX.current = 0;
  };

  const handleMouseDown = (e) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current || isTransitioningRef.current) return;
    const diff = dragStartX.current - e.clientX;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    isDragging.current = false;
    dragStartX.current = 0;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div
      className="relative w-full max-w-[500px] sm:max-w-[560px] lg:max-w-[620px] aspect-square flex items-center justify-center select-none mx-auto cursor-grab active:cursor-grabbing group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      title="Swipe left or right to switch dishes"
    >
      <div className="absolute inset-8 bg-gradient-to-tr from-[#F59E0B]/14 via-[#D97706]/7 to-transparent rounded-full blur-3xl pointer-events-none" />

      <Canvas
        shadows
        camera={{ position: [0, 2.5, 4.2], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full pointer-events-auto"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.1} color="#FFEEDB" />
          <directionalLight
            position={[3.5, 6, 4]}
            intensity={2.2}
            color="#FFF7ED"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-3, 2, 2]} intensity={1.4} color="#F59E0B" />
          <pointLight position={[0, 4, -3]} intensity={1.6} color="#FFFFFF" />

          <ContactShadows
            position={[0, -0.65, 0]}
            opacity={0.78}
            scale={5.2}
            blur={2.4}
            far={3}
            color="#000000"
          />

          <FoodTransition
            currentDish={currentDish}
            incomingDish={dishes[incomingDishIndex]}
            isTransitioning={transitionState.isTransitioning}
            transitionProgress={transitionState.progress}
            direction={transitionState.direction}
          />
        </Suspense>
      </Canvas>

      {dishes.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:-left-3 p-2.5 rounded-full bg-[#181818]/85 hover:bg-[#F59E0B] text-white hover:text-[#121212] border border-white/10 hover:border-[#F59E0B] shadow-xl backdrop-blur-md transition-all cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95 z-30"
            title="Previous Dish"
            aria-label="Previous Dish"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:-right-3 p-2.5 rounded-full bg-[#181818]/85 hover:bg-[#F59E0B] text-white hover:text-[#121212] border border-white/10 hover:border-[#F59E0B] shadow-xl backdrop-blur-md transition-all cursor-pointer opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95 z-30"
            title="Next Dish"
            aria-label="Next Dish"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
            {dishes.map((d, idx) => (
              <button
                key={d.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerTransition(idx, idx > activeDishIndex ? 'next' : 'prev');
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${idx === activeDishIndex
                    ? 'w-7 bg-[#F59E0B]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                title={d.name}
                aria-label={`Select ${d.name}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * FoodPlateScene - Main Resilient Food Presentation Component
 * Wraps 3D in an ErrorBoundary and WebGL detection.
 * If 3D fails or WebGL is unsupported, seamlessly renders the 2D rotating food visual.
 */
export const FoodPlateScene = (props) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setHasWebGL(checkWebGLAvailability());
  }, []);

  const fallback = <FoodPlateFallback2D {...props} />;

  if (!hasWebGL) {
    return fallback;
  }

  return (
    <ErrorBoundary fallback={fallback}>
      <FoodPlate3DCanvas {...props} currentDish={props.dishes?.[props.activeDishIndex] || props.dishes?.[0] || DEFAULT_DISH} />
    </ErrorBoundary>
  );
};

export default FoodPlateScene;
