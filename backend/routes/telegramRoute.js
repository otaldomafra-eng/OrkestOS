import express from 'express';

import { createLinkCode, runDailyBriefings, telegramWebhook } from '../controllers/telegramController.js';
import authUser from '../middlewares/auth.js';

const telegramRouter = express.Router();

telegramRouter.post('/link-code', authUser, createLinkCode);
telegramRouter.post('/webhook', telegramWebhook);
telegramRouter.post('/briefings/daily', runDailyBriefings);

export default telegramRouter;
