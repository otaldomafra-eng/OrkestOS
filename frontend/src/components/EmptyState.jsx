/**
 * EmptyState — shared empty-state card for tracker pages.
 *
 * Props:
 *   icon        ReactNode   Icon displayed at the top of the card.
 *   title       string      Bold headline.
 *   description string      Supporting text below the headline.
 *   actionLabel string      Label for the primary action button.
 *   onAction    func        Callback fired when the button is clicked.
 */
export const EmptyState = ({ icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="bg-surface-card border border-hairline-strong rounded-2xl text-center py-16 px-8 flex flex-col items-center gap-4">
      {icon && (
        <div className="text-accent-yellow">
          {icon}
        </div>
      )}

      {title && (
        <h2 className="text-xl font-bold text-text-primary young-serif-regular">
          {title}
        </h2>
      )}

      {description && (
        <p className="text-mute text-sm max-w-sm">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2 rounded-xl text-sm font-semibold
            bg-white text-black
            hover:opacity-90 active:scale-95
            transition-all duration-150
            mt-2
          "
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
