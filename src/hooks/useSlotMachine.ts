import { useState, useCallback } from 'react';

import { Participant, Role, SpinResult, GameState } from '../types';
import { generateAnnouncement } from '../services/generateAnnouncement';

/** Fisher-Yates shuffle — uniform distribution */
const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const useSlotMachine = (participants: Participant[], roles: Role[]) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [spinResult, setSpinResult] = useState<SpinResult>({});
  const [announcement, setAnnouncement] = useState('');
  const [reelsStoppedCount, setReelsStoppedCount] = useState(0);
  const [activeReelIds, setActiveReelIds] = useState<string[]>([]);

  const startSpinSequence = (roleIdsToSpin: string[]) => {
    setGameState(GameState.SPINNING);
    setAnnouncement('');
    setReelsStoppedCount(0);
    setActiveReelIds(roleIdsToSpin);

    const spinDuration = roleIdsToSpin.length === 1 ? 1500 : 2500;

    setTimeout(() => {
      setGameState(GameState.STOPPING);
    }, spinDuration);
  };

  const handleFullSpin = () => {
    if (roles.length === 0) {
      alert('Please configure at least one role in settings!');
      return;
    }
    if (participants.length < roles.length) {
      alert(`Need at least ${roles.length} participants to fill all roles!`);
      return;
    }

    const shuffled = shuffle(participants);
    const newResults: SpinResult = {};

    roles.forEach((role, index) => {
      newResults[role.id] = shuffled[index];
    });

    setSpinResult(newResults);
    startSpinSequence(roles.map((r) => r.id));
  };

  const handleRespin = (roleId: string) => {
    const winnersOfOtherRoles = roles
      .filter((r) => r.id !== roleId)
      .map((r) => spinResult[r.id]?.id)
      .filter((id) => id !== undefined);

    const candidates = participants.filter(
      (p) => !winnersOfOtherRoles.includes(p.id),
    );

    if (candidates.length === 0) {
      alert('No available participants left to switch to!');
      return;
    }

    const newWinner = candidates[Math.floor(Math.random() * candidates.length)];

    setSpinResult((prev) => ({
      ...prev,
      [roleId]: newWinner,
    }));

    startSpinSequence([roleId]);
  };

  const handleReelStop = useCallback(() => {
    setReelsStoppedCount((prev) => {
      const newVal = prev + 1;

      if (newVal === activeReelIds.length) {
        setGameState(GameState.RESULT);

        const resultList = roles.map((r) => ({
          role: r.name,
          winner: spinResult[r.id]?.name || 'Unknown',
        }));

        generateAnnouncement(resultList).then((text) => setAnnouncement(text));
      }
      return newVal;
    });
  }, [activeReelIds.length, roles, spinResult]);

  const isGameActive =
    gameState === GameState.SPINNING || gameState === GameState.STOPPING;

  return {
    gameState,
    spinResult,
    announcement,
    activeReelIds,
    isGameActive,
    handleFullSpin,
    handleRespin,
    handleReelStop,
  };
};
