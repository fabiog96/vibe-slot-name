import { useEffect, useMemo, useState } from 'react';
import Confetti from 'react-confetti';

import { CommentaryFeed } from './components/CommentaryFeed';
import { Countdown } from './components/Countdown';
import { Header } from './components/Header';
import { RaceTrack3D } from './components/RaceTrack3D';
import { Results } from './components/Results';
import { SettingsModal } from './components/SettingsModal';
import { setMuted } from './audio/sounds';
import { useDuckRace } from './hooks/useDuckRace';
import { useStoredState } from './hooks/useStoredState';
import { Participant, Role, Runner, Turn } from './types';
import { duckColor } from './utils/duckColor';
import { previousHolders, recordTurn } from './utils/turns';

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Capra' },
  { id: '2', name: 'Mapelli' },
  { id: '3', name: 'Baccini' },
  { id: '4', name: 'Farinato' },
  { id: '5', name: 'Yang' },
  { id: '6', name: 'Agati' },
  { id: '7', name: 'Olivieri' },
  { id: '9', name: 'Cariato' },
  { id: '10', name: 'Gioia' },
  { id: '11', name: 'Manduca' },
];

const DEFAULT_ROLES: Role[] = [
  { id: 'r1', name: 'Moderatore' },
  { id: 'r2', name: 'Notaio' },
];

const CONFETTI_COLORS = ['#FFD43B', '#FF8A00', '#FFFFFF', '#33A0D6', '#FF5A5F'];

const presentRunners = (participants: Participant[]): Runner[] =>
  participants.flatMap((p, i) =>
    p.isAbsent ? [] : [{ id: p.id, name: p.name, color: duckColor(i) }],
  );

const warningFor = (runners: Runner[], roles: Role[]) => {
  if (roles.length === 0) return 'Aggiungi almeno un ruolo per partire';
  if (runners.length < roles.length)
    return `Servono almeno ${roles.length} concorrenti per ${roles.length} ruoli`;
  return null;
};

export const App: React.FC = () => {
  const [participants, setParticipants] = useStoredState(
    'participants',
    DEFAULT_PARTICIPANTS,
  );
  const [roles, setRoles] = useStoredState('roles', DEFAULT_ROLES);
  const [turns, setTurns] = useStoredState<Turn[]>('turns', []);
  const [isMuted, setIsMuted] = useStoredState('muted', false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const runners = useMemo(() => presentRunners(participants), [participants]);

  const {
    phase,
    countdown,
    ducks,
    arrivals,
    placements,
    unavailableIds,
    restingIds,
    commentary,
    isRunning,
    hasEnoughRunners,
    startRace,
    toggleAvailability,
  } = useDuckRace(runners, roles, previousHolders(turns));

  const holderIds = placements.map((p) => p.arrival.id).join(',');

  useEffect(() => setMuted(isMuted), [isMuted]);

  useEffect(() => {
    if (phase !== 'finished') return;
    setTurns((prev) => recordTurn(prev, holderIds ? holderIds.split(',') : []));
  }, [phase, holderIds, setTurns]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-river font-body text-ink">
      {phase === 'finished' && (
        <Confetti
          recycle={false}
          numberOfPieces={220}
          gravity={0.14}
          colors={CONFETTI_COLORS}
        />
      )}

      <Header
        roles={roles}
        phase={phase}
        canStart={hasEnoughRunners && !isRunning}
        warning={warningFor(runners, roles)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onStart={startRace}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 min-h-0 w-full max-w-[100rem] mx-auto flex flex-col lg:flex-row gap-4 px-4 pb-4 md:px-6 md:pb-6">
        <section className="relative order-2 flex-1 min-h-80 lg:min-h-0">
          <RaceTrack3D
            runners={runners}
            ducks={ducks}
            arrivals={arrivals}
            phase={phase}
          />
          {phase === 'countdown' && <Countdown value={countdown} />}
          {phase === 'finished' && (
            <Results
              roles={roles}
              arrivals={arrivals}
              placements={placements}
              unavailableIds={unavailableIds}
              restingIds={restingIds}
              onToggleAvailability={toggleAvailability}
            />
          )}
        </section>

        <aside className="order-1 lg:order-3 shrink-0 h-36 lg:h-full lg:w-72 xl:w-80">
          <CommentaryFeed lines={commentary} />
        </aside>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        participants={participants}
        setParticipants={setParticipants}
        roles={roles}
        setRoles={setRoles}
      />
    </div>
  );
};
