import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';

export const SPACE_CURSOR = 'crosshair';

export function useInteractiveCursor() {
  const gl = useThree((state) => state.gl);

  return useCallback(
    (active) => {
      gl.domElement.style.cursor = active ? 'pointer' : SPACE_CURSOR;
    },
    [gl],
  );
}
