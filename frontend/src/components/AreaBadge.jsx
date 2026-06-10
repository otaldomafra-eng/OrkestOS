import { useArea } from '../hooks/useArea';

export default function AreaBadge({ areaId, size = 'sm' }) {
    const { getAreaById } = useArea();
    const area = getAreaById(areaId);
    if (!area) return null;

    const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${padding}`}
            style={{ background: area.color + '22', color: area.color, border: `1px solid ${area.color}44` }}
        >
            <span>{area.icon}</span>
            <span>{area.name}</span>
        </span>
    );
}
