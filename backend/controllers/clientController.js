import clientModel from '../models/clientModel.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listClients = asyncHandler(async (req, res) => {
    const clients = await clientModel.find({ userId: req.user.id }).sort({ name: 1 });
    res.json({ success: true, clients });
});

export const createClient = asyncHandler(async (req, res) => {
    const { name, email, phone, company, notes } = req.body;
    if (!name) return res.json({ success: false, message: 'Nome é obrigatório.' });
    const client = await clientModel.create({ userId: req.user.id, name, email, phone, company, notes });
    res.json({ success: true, client });
});

export const updateClient = asyncHandler(async (req, res) => {
    const { clientId, name, email, phone, company, notes } = req.body;
    const client = await clientModel.findOneAndUpdate(
        { _id: clientId, userId: req.user.id },
        { name, email, phone, company, notes },
        { new: true }
    );
    if (!client) return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    res.json({ success: true, client });
});

export const deleteClient = asyncHandler(async (req, res) => {
    const { clientId } = req.body;
    const client = await clientModel.findOneAndDelete({ _id: clientId, userId: req.user.id });
    if (!client) return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    res.json({ success: true, message: 'Cliente excluído.' });
});
