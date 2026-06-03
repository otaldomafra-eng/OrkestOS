const variants = {
  primary: {
    className: 'bg-white text-black font-semibold hover:opacity-90 active:scale-95',
    style: { boxShadow: '0 0 20px rgba(255,255,255,0.2)' },
  },
  outline: {
    className: 'bg-transparent text-white/70 border border-white/20 hover:border-white/40 hover:text-white active:scale-95',
    style: {},
  },
  ghost: {
    className: 'bg-transparent text-white/45 hover:text-white active:scale-95',
    style: {},
  },
  danger: {
    className: 'bg-transparent text-[#ff2047] border border-[#ff2047]/30 hover:border-[#ff2047]/60 active:scale-95',
    style: {},
  },
};

const Button = ({ children, onClick, className = '', type = 'button', disabled = false, variant = 'primary' }) => {
  const v = variants[variant] ?? variants.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-xl text-sm
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${v.className} ${className}
      `}
      style={v.style}
    >
      {children}
    </button>
  );
};

export default Button;
