interface DismissButtonProps {
  label: string;
  onClick: () => void;
}

export const DismissButton: React.FC<DismissButtonProps> = ({
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="size-8 flex items-center justify-center rounded-full text-ink/40 hover:bg-coral/15 hover:text-coral"
  >
    ✕
  </button>
);
