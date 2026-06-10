import mongoose from 'mongoose';

const installmentSchema = new mongoose.Schema({
    description: { type: String, default: '' },
    amount:      { type: Number, required: true },
    dueDate:     { type: Date },
    paidAt:      { type: Date, default: null },
}, { _id: true });

const projectSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    title:       { type: String, required: true },
    goalId:      { type: mongoose.Schema.Types.ObjectId, ref: 'goal', default: null },
    areaId:      { type: mongoose.Schema.Types.ObjectId, ref: 'area', default: null },
    deadline:    { type: Date },
    description: { type: String, default: '' },
    createdFrom: { type: String, default: 'manual' },

    // Tipo de workflow — define fases e campos específicos
    workflowType: {
        type: String,
        enum: ['engenharia', 'software', 'generico'],
        default: 'generico',
    },
    currentPhase: { type: String, default: '' },

    // Campos de Engenharia
    disciplines: [{ type: String }], // ex: ['Estrutural', 'Hidrossanitário']

    // Campos de Software
    stack:              [{ type: String }], // ex: ['React', 'Node.js']
    repoUrl:            { type: String, default: '' },
    deployUrl:          { type: String, default: '' },
    publishToPortfolio: { type: Boolean, default: false },

    // Camada comercial (projetos externos com cliente)
    clientId:      { type: mongoose.Schema.Types.ObjectId, ref: 'client', default: null },
    contractValue: { type: Number, default: null },
    contractInstallments: [installmentSchema],

}, { minimize: false, timestamps: true });

projectSchema.index({ userId: 1 });

const projectModel = mongoose.models.project || mongoose.model('project', projectSchema);

export default projectModel;
