import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'goal', default: null },
    deadline: { type: Date },
    description: { type: String, default: '' },
    createdFrom: { type: String, default: 'manual' },
    areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'area', default: null },
}, { minimize: false, timestamps: true });

projectSchema.index({ userId: 1 });

const projectModel = mongoose.models.project || mongoose.model('project', projectSchema);

export default projectModel;
