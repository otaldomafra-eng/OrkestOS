import drawingModel from '../models/drawingModel.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listDrawings = asyncHandler(async (req, res) => {
    const { projectId } = req.query;
    const drawings = await drawingModel.find({ userId: req.user.id, projectId }).sort({ drawingNumber: 1 });
    res.json({ success: true, drawings });
});

export const createDrawing = asyncHandler(async (req, res) => {
    const { projectId, drawingNumber, title, discipline, status } = req.body;
    if (!projectId || !drawingNumber || !title) {
        return res.json({ success: false, message: 'projectId, número e título são obrigatórios.' });
    }
    const drawing = await drawingModel.create({
        userId: req.user.id, projectId, drawingNumber, title, discipline: discipline || '', status: status || 'em_elaboracao',
    });
    res.json({ success: true, drawing });
});

export const updateDrawing = asyncHandler(async (req, res) => {
    const { drawingId, drawingNumber, title, discipline, status } = req.body;
    const drawing = await drawingModel.findOneAndUpdate(
        { _id: drawingId, userId: req.user.id },
        { drawingNumber, title, discipline, status },
        { new: true }
    );
    if (!drawing) return res.status(404).json({ success: false, message: 'Prancha não encontrada.' });
    res.json({ success: true, drawing });
});

export const deleteDrawing = asyncHandler(async (req, res) => {
    const { drawingId } = req.body;
    const drawing = await drawingModel.findOneAndDelete({ _id: drawingId, userId: req.user.id });
    if (!drawing) return res.status(404).json({ success: false, message: 'Prancha não encontrada.' });
    res.json({ success: true, message: 'Prancha excluída.' });
});

export const addRevision = asyncHandler(async (req, res) => {
    const { drawingId, code, description } = req.body;
    if (!drawingId || !code) return res.json({ success: false, message: 'drawingId e código são obrigatórios.' });
    const drawing = await drawingModel.findOne({ _id: drawingId, userId: req.user.id });
    if (!drawing) return res.status(404).json({ success: false, message: 'Prancha não encontrada.' });
    drawing.revisions.push({ code, description: description || '', date: new Date() });
    drawing.status = 'revisada';
    await drawing.save();
    res.json({ success: true, drawing });
});
