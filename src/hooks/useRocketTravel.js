import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

export const ROCKET_HOME = new THREE.Vector3(4, 1, 3);

export function useRocketTravel() {
  const [traveling, setTraveling] = useState(false);
  const [targetPosition, setTargetPosition] = useState(null);
  const targetRef = useRef(null);

  const travelTo = useCallback((worldPosition) => {
    if (!worldPosition) return;

    const destination = worldPosition.clone();
    const offset =
      destination.length() > 0.001
        ? destination.clone().normalize().multiplyScalar(1.4)
        : new THREE.Vector3(1.4, 0, 0);
    destination.add(offset);

    targetRef.current = destination;
    setTargetPosition(destination);
    setTraveling(true);
  }, []);

  const returnToSun = useCallback(() => {
    const home = ROCKET_HOME.clone();
    targetRef.current = home;
    setTargetPosition(home);
    setTraveling(true);
  }, []);

  const handleArrived = useCallback(() => {
    setTraveling(false);
  }, []);

  return {
    traveling,
    targetPosition,
    travelTo,
    returnToSun,
    handleArrived,
    targetRef,
  };
}
