const ProgressBar = ({ progress, className = '', color = 'white' }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const barStyles = {
    white: {
      background: 'linear-gradient(90deg, rgba(255,255,255,0.6), #fff)',
      boxShadow: '0 0 10px rgba(255,255,255,0.5)',
    },
    green: {
      background: 'linear-gradient(90deg, rgba(17,255,153,0.6), #11ff99)',
      boxShadow: '0 0 10px rgba(17,255,153,0.5)',
    },
    blue: {
      background: 'linear-gradient(90deg, rgba(59,158,255,0.6), #3b9eff)',
      boxShadow: '0 0 10px rgba(59,158,255,0.5)',
    },
    red: {
      background: 'linear-gradient(90deg, rgba(255,32,71,0.6), #ff2047)',
      boxShadow: '0 0 10px rgba(255,32,71,0.5)',
    },
    yellow: {
      background: 'linear-gradient(90deg, rgba(255,197,61,0.6), #ffc53d)',
      boxShadow: '0 0 10px rgba(255,197,61,0.5)',
    },
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clampedProgress}%`, ...(barStyles[color] ?? barStyles.white) }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;