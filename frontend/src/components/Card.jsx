const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-[#0a0a0c] border border-white/[0.07]
        rounded-2xl p-4
        ${onClick ? 'cursor-pointer transition-colors hover:border-white/[0.13]' : ''}
        ${className}
      `}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
        }}
      />
      {children}
    </div>
  );
};

export default Card;
