import { Check } from 'lucide-react';

/**
 * Pipeline horizontal de fases de projeto.
 * Props: phases (string[]), currentPhase (string), onPhaseChange(phase)
 */
export default function PhaseTimeline({ phases, currentPhase, onPhaseChange }) {
    if (!phases || phases.length === 0) return null;

    const currentIdx = phases.indexOf(currentPhase);

    return (
        <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-0 min-w-max">
                {phases.map((phase, idx) => {
                    const done    = idx < currentIdx;
                    const active  = idx === currentIdx;
                    const future  = idx > currentIdx;

                    return (
                        <div key={phase} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => onPhaseChange?.(phase)}
                                className="flex flex-col items-center gap-1.5 px-1 group"
                            >
                                {/* Círculo */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2"
                                    style={
                                        done
                                            ? { background: '#22c55e', borderColor: '#22c55e', color: '#fff' }
                                            : active
                                            ? { background: 'rgba(120,80,255,0.3)', borderColor: '#7850ff', color: '#fff' }
                                            : { background: 'transparent', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.3)' }
                                    }
                                >
                                    {done ? <Check size={14} /> : idx + 1}
                                </div>
                                {/* Label */}
                                <span
                                    className="text-[10px] font-medium text-center leading-tight max-w-[64px]"
                                    style={{ color: active ? '#fff' : done ? '#22c55e' : 'rgba(255,255,255,0.35)' }}
                                >
                                    {phase}
                                </span>
                            </button>

                            {/* Linha conectora */}
                            {idx < phases.length - 1 && (
                                <div
                                    className="w-8 h-0.5 mb-5 flex-shrink-0"
                                    style={{ background: idx < currentIdx ? '#22c55e' : 'rgba(255,255,255,0.1)' }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
