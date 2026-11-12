import { Participant, Role } from '../types';
import { DismissButton } from './DismissButton';
import { ParticipantEditor } from './ParticipantEditor';
import { RoleEditor } from './RoleEditor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  participants,
  setParticipants,
  roles,
  setRoles,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="animate-rise flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border-3 border-ink bg-paper text-ink shadow-sticker-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-ink/10 px-5 py-3.5">
          <h2 id="settings-title" className="font-display text-2xl">
            Impostazioni
          </h2>
          <DismissButton label="Chiudi" onClick={onClose} />
        </div>

        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 md:grid-cols-2 md:overflow-hidden">
          <ParticipantEditor
            participants={participants}
            setParticipants={setParticipants}
          />
          <div className="md:overflow-y-auto">
            <RoleEditor roles={roles} setRoles={setRoles} />
          </div>
        </div>

        <div className="border-t-2 border-ink/10 px-5 py-3 text-right">
          <button
            onClick={onClose}
            className="min-h-11 rounded-full border-3 border-ink bg-duck px-6 font-display text-lg shadow-sticker transition-transform active:translate-y-0.5"
          >
            Fatto
          </button>
        </div>
      </div>
    </div>
  );
};
