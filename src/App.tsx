import { useState } from 'react';
import Confetti from 'react-confetti';

import { CommentaryBar } from './components/CommentaryBar';
import { Countdown } from './components/Countdown';
import { Header } from './components/Header';
import { ParticipantPanel } from './components/ParticipantPanel';
import { Podium } from './components/Podium';
import { RaceTrack } from './components/RaceTrack';
import { SettingsModal } from './components/SettingsModal';
import { useDuckRace } from './hooks/useDuckRace';
import { Participant, Role } from './types';

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
  { id: 'r1', name: 'Moderator' },
  { id: 'r2', name: 'Notary' },
];

const CONFETTI_COLORS = ['#FFD43B', '#FF8A00', '#FFFFFF', '#33A0D6', '#FF5A5F'];

const warningFor = (participants: Participant[], roles: Role[]) => {
  if (roles.length === 0) return 'Aggiungi almeno un ruolo per partire';
  if (participants.length < roles.length)
    return `Servono almeno ${roles.length} concorrenti per ${roles.length} ruoli`;
  return null;
};

export const App: React.FC = () => {
  const [participants, setParticipants] =
    useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    phase,
    countdown,
    ducks,
    finishers,
    podium,
    commentary,
    isRunning,
    hasEnoughRunners,
    startRace,
  } = useDuckRace(participants, roles);

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
        warning={warningFor(participants, roles)}
        onStart={startRace}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 px-4 pb-4 md:px-6 md:pb-6">
        <aside className="order-2 lg:order-1 shrink-0 h-64 lg:h-full lg:w-72">
          <ParticipantPanel
            participants={participants}
            setParticipants={setParticipants}
            isLocked={isRunning}
          />
        </aside>

        <section className="order-1 lg:order-2 flex-1 min-h-0 flex flex-col gap-3">
          <CommentaryBar text={commentary} />
          <div className="relative flex-1 min-h-0">
            <RaceTrack
              participants={participants}
              ducks={ducks}
              finishers={finishers}
              phase={phase}
            />
            {phase === 'countdown' && <Countdown value={countdown} />}
            {phase === 'finished' && <Podium placements={podium} />}
          </div>
        </section>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        roles={roles}
        setRoles={setRoles}
      />
    </div>
  );
};
