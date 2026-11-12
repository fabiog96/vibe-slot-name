import { useState } from 'react';
import Confetti from 'react-confetti';

import { CommentaryFeed } from './components/CommentaryFeed';
import { Countdown } from './components/Countdown';
import { Header } from './components/Header';
import { RaceTrack3D } from './components/RaceTrack3D';
import { Results } from './components/Results';
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
    arrivals,
    placements,
    unavailableIds,
    commentary,
    isRunning,
    hasEnoughRunners,
    startRace,
    toggleAvailability,
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

      <main className="flex-1 min-h-0 w-full max-w-[100rem] mx-auto flex flex-col lg:flex-row gap-4 px-4 pb-4 md:px-6 md:pb-6">
        <section className="relative order-2 flex-1 min-h-80 lg:min-h-0">
          <RaceTrack3D
            participants={participants}
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
