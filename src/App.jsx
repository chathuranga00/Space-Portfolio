import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import Nebula from './components/Nebula';
import Stars from './components/Stars';
import Sun from './components/Sun';
import Planet from './components/Planet';
import Moon from './components/Moon';
import SpaceStation from './components/SpaceStation';
import AsteroidBelt from './components/AsteroidBelt';
import Rocket from './components/Rocket';
import Astronaut from './components/Astronaut';
import InfoPanel from './components/InfoPanel';
import LoadingScreen from './components/LoadingScreen';
import DemandLoop from './components/DemandLoop';
import SpaceDust from './components/SpaceDust';
import { useRocketTravel } from './hooks/useRocketTravel';
import { useMobile } from './hooks/useMobile';
import aboutData from './data/about';
import projectsData from './data/projects';
import skillsData from './data/skills';
import contactData from './data/contact';

const LOADING_DURATION_MS = 3000;
const INTRO_CAMERA_START = { x: 0, y: 20, z: 60 };
const INTRO_CAMERA_MID = { x: 0, y: 10, z: 30 };
const INTRO_CAMERA_PLAY = { x: 0, y: 8, z: 22 };

const OBJECT_CONFIG = {
  sun: { type: 'about', data: aboutData },
  moon: { type: 'skills', data: skillsData },
  'space-station': { type: 'contact', data: contactData },
  'planet-one-tap-help': { type: 'project', data: projectsData[0] },
  'planet-sketch-ai': { type: 'project', data: projectsData[1] },
  'planet-university': { type: 'project', data: projectsData[2] },
};

function CameraCapture({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);
  return null;
}

function CameraIntro({ isIntro, onReachMidpoint, cameraRef }) {
  const { camera } = useThree();
  const playedRef = useRef(false);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);

  useEffect(() => {
    if (!isIntro || playedRef.current) return;
    playedRef.current = true;

    camera.position.set(
      INTRO_CAMERA_START.x,
      INTRO_CAMERA_START.y,
      INTRO_CAMERA_START.z,
    );
    camera.lookAt(0, 0, 0);

    const timer = setTimeout(() => {
      gsap.to(camera.position, {
        x: INTRO_CAMERA_MID.x,
        y: INTRO_CAMERA_MID.y,
        z: INTRO_CAMERA_MID.z,
        duration: 2.5,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: onReachMidpoint,
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(camera.position);
    };
  }, [isIntro, camera, cameraRef, onReachMidpoint]);

  return null;
}

function Scene({
  isIntro,
  isMobile,
  lowDetail,
  rocketTraveling,
  onReachIntroMidpoint,
  cameraRef,
  controlsRef,
  onSelectObject,
  traveling,
  targetPosition,
  onArrived,
}) {
  const planetScale = isMobile ? 1.5 : 1;

  return (
    <>
      <CameraCapture cameraRef={cameraRef} />
      {isIntro && (
        <CameraIntro
          isIntro={isIntro}
          onReachMidpoint={onReachIntroMidpoint}
          cameraRef={cameraRef}
        />
      )}

      <ambientLight intensity={0.1} />
      <pointLight position={[12, 14, 8]} intensity={1.2} color="#4f9cf9" distance={80} />
      <pointLight position={[-14, 8, -10]} intensity={0.7} color="#8b5cf6" distance={70} />
      <pointLight position={[0, -6, 12]} intensity={0.5} color="#00e5ff" distance={60} />
      <pointLight position={[0, 0, 0]} intensity={0.35} color="#ff6600" distance={25} />

      {!isMobile && <Nebula />}
      <SpaceDust isMobile={isMobile} />
      <Stars isMobile={isMobile} />
      <Sun onSelect={() => onSelectObject('sun')} lowDetail={lowDetail} />
      <Moon onSelect={() => onSelectObject('moon')} lowDetail={lowDetail} />
      <AsteroidBelt isMobile={isMobile} />
      <Rocket
        traveling={traveling}
        targetPosition={targetPosition}
        onArrived={onArrived}
        followCamera={rocketTraveling && !isIntro}
        lowDetail={lowDetail}
      />
      <Planet
        orbitRadius={7}
        speed={1}
        size={0.55}
        color="#4F9CF9"
        name="One Tap Help"
        startAngle={0}
        onSelect={(pos) => onSelectObject('planet-one-tap-help', pos)}
        lowDetail={lowDetail}
        sizeMultiplier={planetScale}
      />
      <Planet
        orbitRadius={11}
        speed={0.85}
        size={0.6}
        color="#8B5CF6"
        name="Sketch AI"
        startAngle={(Math.PI * 2) / 3}
        onSelect={(pos) => onSelectObject('planet-sketch-ai', pos)}
        lowDetail={lowDetail}
        sizeMultiplier={planetScale}
      />
      <Planet
        orbitRadius={15}
        speed={0.7}
        size={0.65}
        color="#22C55E"
        name="University Projects"
        startAngle={(Math.PI * 4) / 3}
        onSelect={(pos) => onSelectObject('planet-university', pos)}
        lowDetail={lowDetail}
        sizeMultiplier={planetScale}
      />
      <SpaceStation
        onSelect={() => onSelectObject('space-station')}
        lowDetail={lowDetail}
      />

      <OrbitControls
        ref={controlsRef}
        enabled={!isIntro && !rocketTraveling}
        enableZoom
        enableRotate
        enablePan
        enableDamping
        touches={{
          ONE: 0,
          TWO: 2,
        }}
        enableKeys={!isMobile}
        minDistance={isMobile ? 14 : 12}
        maxDistance={isMobile ? 45 : 55}
        maxPolarAngle={Math.PI / 2 + 0.35}
        target={[0, 0, 0]}
      />
    </>
  );
}

function IntroOverlay({ visible, onStart }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-[90] flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="pointer-events-auto flex max-w-lg flex-col items-center gap-6 px-6 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <h1 className="glow-text font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome Explorer
            </h1>
            <p className="text-lg text-slate-300/90">Discover My Universe</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="pointer-events-auto relative z-10 cursor-pointer rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-[0_0_28px_rgba(34,211,238,0.45)] hover:brightness-110"
            >
              Start Journey
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileTapHint({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          className="pointer-events-none fixed bottom-20 left-0 right-0 z-30 text-center text-sm font-medium text-cyan-300/90"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          Tap objects to explore
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function NavHint({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed bottom-8 left-1/2 z-30 -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.5 }}
        >
          <p className="glass whitespace-nowrap px-5 py-2.5 text-center text-xs font-medium text-slate-200/90 sm:text-sm">
            🖱️ Drag to rotate &nbsp;•&nbsp; Scroll to zoom &nbsp;•&nbsp; Click
            objects to explore
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const { isMobile } = useMobile();
  const lowDetail = isMobile;

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isIntro, setIsIntro] = useState(true);
  const [introOverlayVisible, setIntroOverlayVisible] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState('about');
  const [panelData, setPanelData] = useState(null);
  const [astronautHidden, setAstronautHidden] = useState(false);
  const [navHintVisible, setNavHintVisible] = useState(false);

  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const pendingPanelRef = useRef(null);

  const {
    traveling: rocketTraveling,
    targetPosition,
    travelTo,
    returnToSun,
    handleArrived,
  } = useRocketTravel();

  const effectiveRocketTraveling = rocketTraveling && !isMobile;

  const useDemandLoop =
    isMobile && !isLoading && !isIntro && !effectiveRocketTraveling;

  const canvasFrameloop =
    isLoading || isIntro || effectiveRocketTraveling ? 'always' : isMobile ? 'demand' : 'always';

  useEffect(() => {
    const start = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - start;
      const next = Math.min(100, (elapsed / LOADING_DURATION_MS) * 100);
      setLoadProgress(next);
      if (next < 100) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const registerInteraction = useCallback(() => {
    if (isMobile) setAstronautHidden(true);
  }, [isMobile]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const openPanelForObject = useCallback((objectId) => {
    const config = OBJECT_CONFIG[objectId];
    if (!config) return;
    setPanelType(config.type);
    setPanelData(config.data);
    setIsPanelOpen(true);
  }, []);

  const handleSelectObject = useCallback(
    (objectId, worldPosition = null) => {
      if (isIntro || isLoading) return;

      registerInteraction();
      setSelectedObject(objectId);
      const config = OBJECT_CONFIG[objectId];
      if (!config) return;

      if (objectId.startsWith('planet-')) {
        if (isMobile) {
          openPanelForObject(objectId);
          return;
        }
        if (worldPosition) {
          pendingPanelRef.current = objectId;
          travelTo(worldPosition);
        }
        return;
      }

      openPanelForObject(objectId);
    },
    [isIntro, isLoading, isMobile, travelTo, openPanelForObject, registerInteraction],
  );

  const handleRocketArrived = useCallback(() => {
    handleArrived();
    const pendingId = pendingPanelRef.current;
    if (pendingId) {
      openPanelForObject(pendingId);
      pendingPanelRef.current = null;
    }
  }, [handleArrived, openPanelForObject]);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedObject(null);
    pendingPanelRef.current = null;
    if (!isMobile) {
      returnToSun();
    }
  }, [returnToSun, isMobile]);

  const handleIntroMidpoint = useCallback(() => {
    setIntroOverlayVisible(true);
  }, []);

  const handleStartJourney = useCallback(() => {
    registerInteraction();
    const camera = cameraRef.current;
    if (!camera) {
      setIntroOverlayVisible(false);
      setIsIntro(false);
      return;
    }

    gsap.to(camera.position, {
      x: INTRO_CAMERA_PLAY.x,
      y: INTRO_CAMERA_PLAY.y,
      z: INTRO_CAMERA_PLAY.z,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(0, 0, 0),
      onComplete: () => {
        setIntroOverlayVisible(false);
        setIsIntro(false);
        controlsRef.current?.update();
      },
    });
  }, [registerInteraction]);

  useEffect(() => {
    if (isLoading || isIntro || isMobile) {
      setNavHintVisible(false);
      return undefined;
    }

    setNavHintVisible(true);
    const timer = setTimeout(() => setNavHintVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [isLoading, isIntro, isMobile]);

  // Fallback: show intro overlay if camera animation doesn't finish
  useEffect(() => {
    if (isLoading || !isIntro || introOverlayVisible) return undefined;
    const timer = setTimeout(() => setIntroOverlayVisible(true), 4500);
    return () => clearTimeout(timer);
  }, [isLoading, isIntro, introOverlayVisible]);

  const showMobileHint =
    isMobile && !isLoading && !isIntro && !isPanelOpen && astronautHidden;

  const showIntro = introOverlayVisible && !isLoading;
  const blockCanvasPointers = showIntro || isPanelOpen;

  return (
    <div className="fixed inset-0 h-svh w-full overflow-hidden bg-[#050816]">
      {/* 3D scene layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          className="space-canvas !h-full !w-full"
          frameloop={canvasFrameloop}
          camera={{
            position: [
              INTRO_CAMERA_START.x,
              INTRO_CAMERA_START.y,
              INTRO_CAMERA_START.z,
            ],
            fov: 50,
          }}
          style={{
            width: '100%',
            height: '100%',
            background: '#050816',
            pointerEvents: blockCanvasPointers ? 'none' : 'auto',
          }}
        >
          {useDemandLoop && <DemandLoop active />}
          <Scene
            isIntro={isIntro && !isLoading}
            isMobile={isMobile}
            lowDetail={lowDetail}
            rocketTraveling={effectiveRocketTraveling}
            onReachIntroMidpoint={handleIntroMidpoint}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            onSelectObject={handleSelectObject}
            traveling={effectiveRocketTraveling}
            targetPosition={isMobile ? null : targetPosition}
            onArrived={handleRocketArrived}
          />
        </Canvas>
      </div>

      {/* UI overlay layer — above canvas */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {isLoading && (
          <LoadingScreen
            progress={loadProgress}
            onComplete={handleLoadingComplete}
          />
        )}

        <IntroOverlay visible={showIntro} onStart={handleStartJourney} />

        <MobileTapHint visible={showMobileHint} />
        <NavHint visible={navHintVisible} />

        <Astronaut
          isMobile={isMobile}
          hidden={astronautHidden}
          onInteract={registerInteraction}
        />

        <InfoPanel
          isOpen={isPanelOpen}
          onClose={closePanel}
          type={panelType}
          data={panelData}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
