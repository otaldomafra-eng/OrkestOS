import { useArea } from '../hooks/useArea';

/**
 * Dropdown de seleção de área.
 * Props: value (areaId|null), onChange(areaId|null), className
 */
export default function AreaSelector({ value, onChange, className = '' }) {
    const { areas } = useArea();

    if (!areas.length) return null;

    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            <button
                type="button"
                onClick={() => onChange(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    !value
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                }`}
            >
                Todas
            </button>
            {areas.map(area => (
                <button
                    key={area.id}
                    type="button"
                    onClick={() => onChange(value === area.id ? null : area.id)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all border"
                    style={
                        value === area.id
                            ? { background: area.color + '33', borderColor: area.color + '88', color: area.color }
                            : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                    }
                >
                    {area.icon} {area.name}
                </button>
            ))}
        </div>
    );
}
