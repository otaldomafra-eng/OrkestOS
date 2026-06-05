import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: true },
    type: { type: String, default: 'personal' },
    description: { type: String, default: '' },
    deadline: { type: Date },
}, { minimize: false, timestamps: true });

goalSchema.index({ userId: 1 });

const goalModel = mongoose.models.goal || mongoose.model('goal', goalSchema);

export default goalModel;
