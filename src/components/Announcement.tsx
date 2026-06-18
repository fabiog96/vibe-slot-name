import { GameState } from '../types';

interface AnnouncementProps {
  gameState: GameState;
  announcement: string;
}

export const Announcement: React.FC<AnnouncementProps> = ({ gameState, announcement }) => {
  if (gameState !== GameState.RESULT) return <div className="mt-4 w-full max-w-md min-h-[36px]" />;

  return (
    <div className="mt-4 w-full max-w-md min-h-[36px] flex items-center justify-center text-center">
      <div className="animate-fade-in-up w-full px-4 py-3 neon-frame notch">
        {announcement ? (
          <p className="font-body text-sm text-ink-2 leading-relaxed">
            {announcement}
          </p>
        ) : (
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-neon-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
