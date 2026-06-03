const Card = ({ children, className = '', onClick }) => {
  const interactive = Boolean(onClick);
  return (
    <div
      onClick={onClick}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
      className={`
        relative overflow-hidden
        border border-white/[0.08]
        rounded-2xl p-4
        ${interactive ? 'cursor-pointer transition-all hover:border-[rgba(120,80,255,0.35)] outline-none focus-visible:ring-1 focus-visible:ring-white/30' : ''}
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
