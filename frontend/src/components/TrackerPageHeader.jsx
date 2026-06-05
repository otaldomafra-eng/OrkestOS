/**
 * TrackerPageHeader — shared page header for tracker pages.
 *
 * Props:
 *   title       string      Main page title rendered as h1.
 *   subtitle    string      Supporting paragraph below the title.
 *   actionLabel string      Label for the primary action button.
 *   onAction    func        Callback fired when the button is clicked.
 *   actionIcon  ReactNode   (optional) Icon rendered inside the button.
 */
export const TrackerPageHeader = ({ title, subtitle, actionLabel, onAction, actionIcon }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        {title && (
          <h1 className="text-3xl font-bold text-ink young-serif-regular">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-mute">
            {subtitle}
          </p>
        )}
      </div>

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
          "
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}
        >
          {actionIcon && <span>{actionIcon}</span>}
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default TrackerPageHeader;
