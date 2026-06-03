import { motion } from 'framer-motion';

const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer select-none">

      <div className="relative">

        {/* Hidden Input (DO NOT TOUCH LOGIC) */}
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />

        {/* TRACK (Background) */}
        <div
          className={`
            w-14 h-8 rounded-full transition-all duration-300
            ${checked
              ? 'bg-accent-green'
              : 'bg-stone'
            }
          `}
        />

        {/* THUMB (Bullet) */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`
            absolute top-1 left-1 w-6 h-6 rounded-full bg-white
            flex items-center justify-center
            ${checked ? 'translate-x-6' : ''}
          `}
        >
          {/* INNER DOT */}
          <div
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${checked ? 'bg-accent-green' : 'bg-ash'}
            `}
          />
        </motion.div>

      </div>

      {/* LABEL */}
      {label && (
        <span className="ml-3 text-sm text-charcoal">
          {label}
        </span>
      )}
    </label>
  );
};

export default ToggleSwitch;