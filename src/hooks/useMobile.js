import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function getViewportFlags() {
  if (typeof window === 'undefined') {
    return { isMobile: false, isTablet: false };
  }
  const width = window.innerWidth;
  return {
    isMobile: width < MOBILE_BREAKPOINT,
    isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
  };
}

export function useMobile() {
  const [flags, setFlags] = useState(getViewportFlags);

  useEffect(() => {
    const handleResize = () => setFlags(getViewportFlags());
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return flags;
}
