import { useState, useEffect, useCallback } from 'react';

interface CountdownState {
  secondsLeft: number;
  totalSeconds: number;
  isExpired: boolean;
  formatted: string;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const useCountdown = (endTime: number | null, totalSeconds: number = 120) => {
  const calcSecondsLeft = useCallback(() => {
    if (!endTime) return 0;
    return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  }, [endTime]);

  const [state, setState] = useState<CountdownState>({
    secondsLeft: calcSecondsLeft(),
    totalSeconds,
    isExpired: false,
    formatted: formatTime(calcSecondsLeft()),
  });

  useEffect(() => {
    if (!endTime) {
      setState({ secondsLeft: 0, totalSeconds, isExpired: false, formatted: '0:00' });
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setState({
        secondsLeft: left,
        totalSeconds,
        isExpired: left === 0,
        formatted: formatTime(left),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, totalSeconds]);

  return state;
};
