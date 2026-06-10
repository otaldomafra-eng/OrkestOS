import mongoose from 'mongoose';

const revisionSchema = new mongoose.Schema({
    code:        { type: String, required: true }, // R00, R01...
    date:        { type: Date, default: Date.now },
    description: { type: String, default: '' },
}, { _id: true });

const drawingSchema = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    projectId:     { type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true },
    drawingNumber: { type: String, required: true }, // ex: EST-001
    title:         { type: String, required: true },
    discipline:    { type: String, default: '' }, // Estrutural, Hidrossanitário...
    status: {
        type: String,
        enum: ['em_elaboracao', 'emitida', 'revisada'],
        default: 'em_elaboracao',
    },
    revisions: [revisionSchema],
}, { minimize: false, timestamps: true });

drawingSchema.index({ projectId: 1 });
drawingSchema.index({ userId: 1 });

const drawingModel = mongoose.models.drawing || mongoose.model('drawing', drawingSchema);

export default drawingModel;
