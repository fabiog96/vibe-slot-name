import { useCallback, useEffect, useRef, useState } from 'react';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export const useEasterEggs = (onKonamiSpin: () => void) => {
  const [konamiActive, setKonamiActive] = useState(false);
  const [jackpotMode, setJackpotMode] = useState(false);

  const konamiIndex = useRef(0);
  const logoClicks = useRef(0);
  const logoTimeout = useRef<number | null>(null);

  // ── Konami Code ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === KONAMI_SEQUENCE[konamiIndex.current]) {
        konamiIndex.current += 1;

        if (konamiIndex.current === KONAMI_SEQUENCE.length) {
          konamiIndex.current = 0;
          setKonamiActive(true);
          onKonamiSpin();
          setTimeout(() => setKonamiActive(false), 4000);
        }
      } else {
        konamiIndex.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKonamiSpin]);

  // ── Logo 7-click Jackpot Mode ──
  const handleLogoClick = useCallback(() => {
    logoClicks.current += 1;

    if (logoTimeout.current) clearTimeout(logoTimeout.current);
    logoTimeout.current = window.setTimeout(() => {
      logoClicks.current = 0;
    }, 2000);

    if (logoClicks.current >= 7) {
      logoClicks.current = 0;
      setJackpotMode((prev) => !prev);
    }
  }, []);

  return {
    konamiActive,
    jackpotMode,
    handleLogoClick,
  };
};
