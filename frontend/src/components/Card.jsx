const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        border border-white/[0.08]
        rounded-2xl p-4
        ${onClick ? 'cursor-pointer transition-all hover:border-[rgba(120,80,255,0.35)]' : ''}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(120,80,255,0.04) 0%, rgba(10,10,14,0.9) 45%, rgba(10,10,14,0.9) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(120,80,255,0.35), transparent)',
        }}
      />
      {children}
    </div>
  );
};

export default Card;
