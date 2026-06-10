import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trophy, ExternalLink, Github, FileText, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from './Card';
import DonutChart from './DonutChart';
import Button from './GradientButton';
import TaskItem from './TaskItem';
import PhaseTimeline from './PhaseTimeline';
import AreaBadge from './AreaBadge';
import Modal from './Modal';
import InputField from './InputField';
import { WORKFLOW_PHASES, WORKFLOW_TYPE_ICON, ENGINEERING_DISCIPLINES, DRAWING_STATUS } from '../data/workflowConfig';
import { drawingAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';

const EMPTY_DRAWING = { drawingNumber: '', title: '', discipline: '', status: 'em_elaboracao' };
const EMPTY_REVISION = { code: '', description: '' };

export default function ProjectWorkflowView({
    project,
    tasks = [],
    linkedGoal,
    linkedClient,
    progress = 0,
    onBack,
    onAddTask,
    onToggleTask,
    onCompleteProject,
    onUpdateProject,
    showXP = true,
}) {
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', deadline: '', isImportant: false });

    // Drawings (engenharia)
    const [drawings, setDrawings] = useState([]);
    const [showAddDrawing, setShowAddDrawing] = useState(false);
    const [newDrawing, setNewDrawing] = useState(EMPTY_DRAWING);
    const [revisionTarget, setRevisionTarget] = useState(null); // drawingId
    const [newRevision, setNewRevision] = useState(EMPTY_REVISION);

    const phases = WORKFLOW_PHASES[project.workflowType] || [];
    const typeIcon = WORKFLOW_TYPE_ICON[project.workflowType] || '📁';

    useEffect(() => {
        if (project.workflowType === 'engenharia') {
            drawingAPI.getByProject(project._id || project.id).then(res => {
                if (res.success) setDrawings(res.drawings);
            });
        }
    }, [project._id, project.id, project.workflowType]);

    const handleAddTask = () => {
        if (!newTask.title.trim()) return;
        onAddTask?.({ ...newTask, projectId: project.id });
        setNewTask({ title: '', deadline: '', isImportant: false });
        setShowAddTask(false);
    };

    const handlePhaseChange = (phase) => {
        onUpdateProject?.(project.id, { currentPhase: phase });
    };

    const handleAddDrawing = async () => {
        if (!newDrawing.drawingNumber.trim() || !newDrawing.title.trim()) return;
        const res = await drawingAPI.create({ projectId: project._id || project.id, ...newDrawing });
        if (res.success) {
            setDrawings(prev => [...prev, res.drawing]);
            setNewDrawing(EMPTY_DRAWING);
            setShowAddDrawing(false);
            showToast({ message: 'Prancha adicionada', status: 'success' });
        }
    };

    const handleDeleteDrawing = async (drawingId) => {
        const res = await drawingAPI.delete(drawingId);
        if (res.success) setDrawings(prev => prev.filter(d => d._id !== drawingId));
    };

    const handleAddRevision = async () => {
        if (!newRevision.code.trim()) return;
        const res = await drawingAPI.addRevision({ drawingId: revisionTarget, ...newRevision });
        if (res.success) {
            setDrawings(prev => prev.map(d => d._id === revisionTarget ? res.drawing : d));
            setNewRevision(EMPTY_REVISION);
            setRevisionTarget(null);
            showToast({ message: 'Revisão adicionada', status: 'success' });
        }
    };

    return (
        <div className="min-h-screen bg-canvas pb-20 px-4 pt-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Voltar */}
                <button onClick={onBack} className="flex items-center gap-2 text-mute hover:text-ink transition-all hover:-translate-x-1">
                    <ArrowLeft size={20} /> Voltar aos Projetos
                </button>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="text-2xl">{typeIcon}</span>
                                    <h1 className="text-2xl font-bold text-ink">{project.title}</h1>
                                    {project.areaId && <AreaBadge areaId={project.areaId} />}
                                </div>

                                {project.description && <p className="text-mute text-sm mb-3">{project.description}</p>}

                                <div className="flex flex-wrap gap-3 text-sm text-white/50">
                                    {linkedGoal && <span>🎯 {linkedGoal.title}</span>}
                                    {linkedClient && <span>👤 {linkedClient.name}</span>}
                                    {project.contractValue && (
                                        <span className="text-yellow-400">
                                            💰 R$ {project.contractValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                    {project.deadline && (
                                        <span>📅 {new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                                    )}
                                </div>

                                {/* Software links */}
                                {project.workflowType === 'software' && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {project.repoUrl && (
                                            <a href={project.repoUrl} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
                                                <Github size={13} /> Repositório
                                            </a>
                                        )}
                                        {project.deployUrl && (
                                            <a href={project.deployUrl} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-accent-blue hover:text-white transition-colors">
                                                <ExternalLink size={13} /> Ver deploy
                                            </a>
                                        )}
                                        {project.stack?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {project.stack.map(s => (
                                                    <span key={s} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-shrink-0">
                                <DonutChart value={progress} size={90} color="#10b981" />
                                <p className="text-center text-xs text-accent-green mt-1">{progress}%</p>
                            </div>
                        </div>

                        {showXP && progress >= 100 && onCompleteProject && (
                            <div className="mt-4 pt-4 border-t border-white/[0.07]">
                                <Button variant="primary" onClick={() => onCompleteProject(project)} className="w-full">
                                    <Trophy size={16} /> Receber XP por Concluir Projeto
                                </Button>
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Pipeline de fases */}
                {phases.length > 0 && (
                    <Card>
                        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Fase Atual</h2>
                        <PhaseTimeline phases={phases} currentPhase={project.currentPhase} onPhaseChange={handlePhaseChange} />
                    </Card>
                )}

                {/* Pranchas (engenharia) */}
                {project.workflowType === 'engenharia' && (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-ink">Pranchas</h2>
                            <Button variant="secondary" onClick={() => setShowAddDrawing(true)}>
                                <Plus size={15} /> Nova Prancha
                            </Button>
                        </div>

                        {drawings.length === 0 ? (
                            <p className="text-mute text-center py-6 text-sm">Nenhuma prancha cadastrada ainda.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-white/40 text-xs uppercase tracking-wide border-b border-white/5">
                                            <th className="text-left pb-2 pr-4">Número</th>
                                            <th className="text-left pb-2 pr-4">Título</th>
                                            <th className="text-left pb-2 pr-4">Disciplina</th>
                                            <th className="text-left pb-2 pr-4">Status</th>
                                            <th className="text-left pb-2 pr-4">Revisões</th>
                                            <th className="pb-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {drawings.map(d => {
                                            const st = DRAWING_STATUS[d.status];
                                            return (
                                                <tr key={d._id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-2.5 pr-4 font-mono text-white/80">{d.drawingNumber}</td>
                                                    <td className="py-2.5 pr-4 text-ink">{d.title}</td>
                                                    <td className="py-2.5 pr-4 text-white/50">{d.discipline || '—'}</td>
                                                    <td className="py-2.5 pr-4">
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                            style={{ background: st.color + '22', color: st.color, border: `1px solid ${st.color}44` }}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white/40 text-xs">
                                                                {d.revisions?.length > 0
                                                                    ? d.revisions.map(r => r.code).join(', ')
                                                                    : 'R00'}
                                                            </span>
                                                            <button onClick={() => setRevisionTarget(d._id)}
                                                                className="p-1 hover:text-accent-blue transition-colors text-white/30" title="Adicionar revisão">
                                                                <RefreshCw size={12} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5">
                                                        <button onClick={() => handleDeleteDrawing(d._id)}
                                                            className="p-1 hover:text-red-400 transition-colors text-white/20">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                )}

                {/* Tarefas */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-ink">Tarefas</h2>
                        <Button variant="primary" onClick={() => setShowAddTask(true)}>
                            <Plus size={16} /> Adicionar
                        </Button>
                    </div>

                    {tasks.length > 0 ? (
                        <div className="space-y-3">
                            {tasks.map((task, idx) => (
                                <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                                    <TaskItem task={task} onToggle={onToggleTask} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-mute text-center py-8 text-sm">Nenhuma tarefa. Adicione a primeira!</p>
                    )}
                </Card>
            </div>

            {/* Modal: adicionar tarefa */}
            <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Nova Tarefa">
                <div className="space-y-4">
                    <InputField label="Título" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Título da tarefa" />
                    <InputField label="Prazo (Opcional)" type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                    <div className="flex items-center justify-between bg-surface-card border border-hairline-strong rounded-lg px-4 py-3">
                        <label className="text-charcoal text-sm">Importante</label>
                        <input type="checkbox" checked={newTask.isImportant} onChange={e => setNewTask({ ...newTask, isImportant: e.target.checked })} className="w-5 h-5 accent-yellow-500" />
                    </div>
                    <Button variant="primary" onClick={handleAddTask} className="w-full">Adicionar Tarefa</Button>
                </div>
            </Modal>

            {/* Modal: nova prancha */}
            <Modal isOpen={showAddDrawing} onClose={() => setShowAddDrawing(false)} title="Nova Prancha">
                <div className="space-y-4">
                    <InputField label="Número da prancha" value={newDrawing.drawingNumber} onChange={e => setNewDrawing({ ...newDrawing, drawingNumber: e.target.value })} placeholder="ex: EST-001" />
                    <InputField label="Título" value={newDrawing.title} onChange={e => setNewDrawing({ ...newDrawing, title: e.target.value })} placeholder="Planta Baixa Estrutural" />
                    <div>
                        <label className="block text-charcoal text-sm font-medium mb-2">Disciplina</label>
                        <select value={newDrawing.discipline} onChange={e => setNewDrawing({ ...newDrawing, discipline: e.target.value })}
                            className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue">
                            <option value="">Selecione...</option>
                            {ENGINEERING_DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <Button variant="primary" onClick={handleAddDrawing} className="w-full">Adicionar Prancha</Button>
                </div>
            </Modal>

            {/* Modal: nova revisão */}
            <Modal isOpen={!!revisionTarget} onClose={() => setRevisionTarget(null)} title="Adicionar Revisão">
                <div className="space-y-4">
                    <InputField label="Código da revisão" value={newRevision.code} onChange={e => setNewRevision({ ...newRevision, code: e.target.value })} placeholder="ex: R01" />
                    <InputField label="Motivo / Descrição" value={newRevision.description} onChange={e => setNewRevision({ ...newRevision, description: e.target.value })} placeholder="Correção de cotas" />
                    <Button variant="primary" onClick={handleAddRevision} className="w-full">Registrar Revisão</Button>
                </div>
            </Modal>
        </div>
    );
}
