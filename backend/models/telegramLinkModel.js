import mongoose from 'mongoose';

const telegramLinkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    code: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'linked'], default: 'pending' },
    telegramChatId: { type: String, default: null, index: true },
    telegramFirstName: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
    linkedAt: { type: Date, default: null }
}, { minimize: false, timestamps: true });

telegramLinkSchema.index({ userId: 1, status: 1 });
telegramLinkSchema.index({ code: 1, status: 1 });

const telegramLinkModel = mongoose.models.telegramLink || mongoose.model('telegramLink', telegramLinkSchema);

export default telegramLinkModel;
