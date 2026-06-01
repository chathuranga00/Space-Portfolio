import { useFrame, useThree } from '@react-three/fiber';

/** Keeps frameloop="demand" rendering while the scene animates. */
export default function DemandLoop({ active }) {
  const invalidate = useThree((state) => state.invalidate);

  useFrame(() => {
    if (active) invalidate();
  });

  return null;
}
