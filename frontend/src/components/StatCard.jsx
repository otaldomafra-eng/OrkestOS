const accentMap = {
  blue: { bg: 'bg-[rgba(59,158,255,0.12)]', text: 'text-accent-blue' },
  green: { bg: 'bg-[rgba(17,255,153,0.12)]', text: 'text-accent-green' },
  red: { bg: 'bg-[rgba(255,32,71,0.12)]', text: 'text-accent-red' },
  purple: { bg: 'bg-[rgba(163,128,255,0.12)]', text: 'text-[#a380ff]' },
  default: { bg: 'bg-surface-elevated', text: 'text-ink' },
};

const StatCard = ({ title, value, icon, trend, className = '', accent = 'default' }) => {
  const a = accentMap[accent] || accentMap.default;
  return (
    <div className={`bg-surface-card border border-hairline-strong rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-mute text-xs md:text-sm">{title}</p>
          <p className="text-2xl font-semibold text-ink mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.positive ? 'text-accent-green' : 'text-accent-red'}`}>
              {trend.positive ? '+' : '-'} {trend.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`${a.bg} ${a.text} p-2 md:p-3 rounded-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
