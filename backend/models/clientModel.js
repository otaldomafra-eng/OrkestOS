import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name:    { type: String, required: true },
    email:   { type: String, default: '' },
    phone:   { type: String, default: '' },
    company: { type: String, default: '' },
    notes:   { type: String, default: '' },
}, { minimize: false, timestamps: true });

clientSchema.index({ userId: 1 });

const clientModel = mongoose.models.client || mongoose.model('client', clientSchema);

export default clientModel;
