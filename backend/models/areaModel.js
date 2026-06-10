import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name:    { type: String, required: true },
    icon:    { type: String, default: '📁' },
    color:   { type: String, default: '#6366f1' },
    order:   { type: Number, default: 0 },
    type: {
        type: String,
        enum: ['trabalho', 'freelance', 'dev', 'financas', 'vida', 'saude', 'custom'],
        default: 'custom',
    },
}, { minimize: false, timestamps: true });

areaSchema.index({ userId: 1, order: 1 });

const areaModel = mongoose.models.area || mongoose.model('area', areaSchema);

export default areaModel;
