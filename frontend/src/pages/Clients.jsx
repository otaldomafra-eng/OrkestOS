import { useState, useEffect } from 'react';
import { Plus, Users, Pencil, Trash2, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Button from '../components/GradientButton';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import TrackerPageHeader from '../components/TrackerPageHeader';
import { clientAPI } from '../api/apiService';
import { showToast } from '../utils/toastHelper';

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', notes: '' };

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        clientAPI.getAll().then(res => {
            if (res.success) setClients(res.clients);
            setLoading(false);
        });
    }, []);

    const openCreate = () => {
        setEditingClient(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (client) => {
        setEditingClient(client);
        setForm({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            company: client.company || '',
            notes: client.notes || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        if (editingClient) {
            const res = await clientAPI.update({ clientId: editingClient._id, ...form });
            if (res.success) {
                setClients(prev => prev.map(c => c._id === editingClient._id ? res.client : c));
                showToast({ message: 'Cliente atualizado', status: 'success' });
            }
        } else {
            const res = await clientAPI.create(form);
            if (res.success) {
                setClients(prev => [...prev, res.client]);
                showToast({ message: 'Cliente criado', status: 'success' });
            }
        }
        setShowModal(false);
    };

    const handleDelete = async (clientId) => {
        const res = await clientAPI.delete(clientId);
        if (res.success) {
            setClients(prev => prev.filter(c => c._id !== clientId));
            showToast({ message: 'Cliente removido', status: 'success' });
        }
    };

    return (
        <div className="min-h-screen bg-canvas pb-20 px-4 pt-6">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <TrackerPageHeader
                        title="Clientes"
                        subtitle="Gerencie seus clientes parceiros"
                        actionLabel="Novo Cliente"
                        onAction={openCreate}
                        actionIcon={<Plus size={18} />}
                    />
                </motion.div>

                {loading ? (
                    <div className="text-center py-20 text-white/40">Carregando...</div>
                ) : clients.length === 0 ? (
                    <EmptyState
                        icon={<Users size={64} className="animate-pulse" />}
                        title="Nenhum cliente ainda"
                        description="Cadastre seus clientes parceiros para vincular a projetos"
                        actionLabel="Adicionar Primeiro Cliente"
                        onAction={openCreate}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {clients.map((client, idx) => (
                            <motion.div key={client._id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                            >
                                <Card>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-ink text-lg">{client.name}</h3>
                                            {client.company && <p className="text-white/50 text-sm">{client.company}</p>}
                                            {client.email && <p className="text-white/40 text-xs mt-1">{client.email}</p>}
                                            {client.phone && <p className="text-white/40 text-xs">{client.phone}</p>}
                                            {client.notes && <p className="text-white/35 text-xs mt-2 italic">{client.notes}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(client)}
                                                className="p-2 hover:text-accent-blue transition-colors text-white/30">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(client._id)}
                                                className="p-2 hover:text-red-400 transition-colors text-white/30">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Nome *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do cliente" required />
                    <InputField label="Empresa (Opcional)" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Construtora XYZ" />
                    <InputField label="E-mail (Opcional)" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" />
                    <InputField label="Telefone (Opcional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
                    <div>
                        <label className="block text-charcoal text-sm font-medium mb-2">Observações (Opcional)</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="Notas sobre o cliente..."
                            className="w-full bg-surface-elevated text-ink border border-hairline-strong rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-blue min-h-[80px] resize-none" />
                    </div>
                    <Button variant="primary" type="submit" className="w-full">
                        {editingClient ? 'Salvar alterações' : 'Criar cliente'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
