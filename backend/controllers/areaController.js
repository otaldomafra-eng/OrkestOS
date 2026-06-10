import areaModel from '../models/areaModel.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listAreas = asyncHandler(async (req, res) => {
    const areas = await areaModel.find({ userId: req.user.id }).sort({ order: 1 });
    res.json({ success: true, areas });
});

export const createArea = asyncHandler(async (req, res) => {
    const { name, icon, color, type, order } = req.body;
    const area = await areaModel.create({ userId: req.user.id, name, icon, color, type, order });
    res.json({ success: true, area });
});

export const updateArea = asyncHandler(async (req, res) => {
    const { areaId, name, icon, color, type, order } = req.body;
    const area = await areaModel.findOneAndUpdate(
        { _id: areaId, userId: req.user.id },
        { name, icon, color, type, order },
        { new: true }
    );
    if (!area) return res.status(404).json({ success: false, message: 'Área não encontrada.' });
    res.json({ success: true, area });
});

export const deleteArea = asyncHandler(async (req, res) => {
    const { areaId } = req.body;
    const area = await areaModel.findOneAndDelete({ _id: areaId, userId: req.user.id });
    if (!area) return res.status(404).json({ success: false, message: 'Área não encontrada.' });
    res.json({ success: true, message: 'Área excluída.' });
});

export const reorderAreas = asyncHandler(async (req, res) => {
    const { order } = req.body; // [{ areaId, order }]
    await Promise.all(order.map(({ areaId, order: o }) =>
        areaModel.updateOne({ _id: areaId, userId: req.user.id }, { order: o })
    ));
    res.json({ success: true });
});
