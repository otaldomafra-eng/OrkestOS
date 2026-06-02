import {
    createTelegramLinkCode,
    handleTelegramCommand,
    sendDailyBriefings,
    sendTelegramMessage
} from '../services/telegramCommandService.js';

const createLinkCode = async (req, res) => {
    try {
        const userId = req.body.userId;
        const result = await createTelegramLinkCode(userId);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const telegramWebhook = async (req, res) => {
    try {
        const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
        const receivedSecret = req.headers['x-telegram-webhook-secret'] || req.query.secret;

        if (expectedSecret && receivedSecret !== expectedSecret) {
            return res.status(401).json({ success: false, message: 'Invalid Telegram webhook secret' });
        }

        const message = req.body?.message;

        if (!message?.chat?.id || !message?.text) {
            return res.json({ success: true, message: 'No text message to process' });
        }

        const commandResult = await handleTelegramCommand({
            chatId: message.chat.id,
            text: message.text,
            firstName: message.from?.first_name || ''
        });

        const sendResult = await sendTelegramMessage(message.chat.id, commandResult.text);

        res.json({
            success: true,
            command: commandResult,
            telegram: sendResult
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const runDailyBriefings = async (req, res) => {
    try {
        const expectedSecret = process.env.TELEGRAM_CRON_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET;
        const receivedSecret = req.headers['x-telegram-cron-secret'] || req.query.secret;

        if (expectedSecret && receivedSecret !== expectedSecret) {
            return res.status(401).json({ success: false, message: 'Segredo do cron Telegram inválido' });
        }

        const result = await sendDailyBriefings();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { createLinkCode, runDailyBriefings, telegramWebhook };
