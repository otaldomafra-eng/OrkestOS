import crypto from 'node:crypto';

import dailyPlanModel from '../models/dailyPlanModel.js';
import habitModel from '../models/habitModel.js';
import taskModel from '../models/taskModel.js';
import telegramLinkModel from '../models/telegramLinkModel.js';

const LINK_CODE_TTL_MINUTES = 15;
const MAX_LIST_ITEMS = 5;

const HELP_TEXT = [
    'Comandos do OrkestOS:',
    '/link CODIGO - vincula sua conta',
    '/briefing - resumo do dia',
    '/hoje - plano de hoje',
    '/tarefas - tarefas pendentes',
    '/habitos - hábitos e sequências',
    '/add tarefa TITULO - cria uma tarefa'
].join('\n');

function parseTelegramCommand(text = '') {
    const trimmed = text.trim();
    if (!trimmed.startsWith('/')) {
        return { command: '', args: trimmed };
    }

    const [rawCommand, ...rest] = trimmed.slice(1).split(/\s+/);
    const command = rawCommand.split('@')[0].toLowerCase();

    return {
        command,
        args: rest.join(' ').trim()
    };
}

function buildLinkCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function createTelegramLinkCode(userId) {
    await telegramLinkModel.deleteMany({ userId, status: 'pending' });

    const link = new telegramLinkModel({
        userId,
        code: buildLinkCode(),
        status: 'pending',
        expiresAt: new Date(Date.now() + LINK_CODE_TTL_MINUTES * 60 * 1000)
    });

    await link.save();

    return {
        success: true,
        code: link.code,
        expiresAt: link.expiresAt
    };
}

async function findLinkedAccount(chatId) {
    return telegramLinkModel.findOne({
        telegramChatId: String(chatId),
        status: 'linked'
    });
}

function needsLinkedAccountText() {
    return 'Vincule sua conta primeiro. No OrkestOS, gere um código Telegram e envie /link CODIGO aqui.';
}

function formatItems(items, formatter, emptyText) {
    if (!items || items.length === 0) {
        return emptyText;
    }

    return items.map((item, index) => `${index + 1}. ${formatter(item)}`).join('\n');
}

function isCompletedToday(date) {
    if (!date) return false;
    return new Date(date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
}

async function getTodayPlanText(userId) {
    const today = new Date().toISOString().split('T')[0];
    const plan = await dailyPlanModel.findOne({ userId, date: today });
    const plannedTasks = plan?.plannedTasks || [];
    const doneCount = plannedTasks.filter((task) => task.completed).length;

    return [
        `Plano de hoje (${doneCount}/${plannedTasks.length} concluídas):`,
        formatItems(
            plannedTasks.slice(0, MAX_LIST_ITEMS),
            (task) => `${task.completed ? '[x]' : '[ ]'} ${task.isImportant ? '!' : '-'} ${task.title}`,
            'Nenhuma tarefa planejada para hoje.'
        )
    ].join('\n');
}

async function getPendingTasksText(userId) {
    const pendingTasks = await taskModel
        .find({ userId, completed: false })
        .sort({ isImportant: -1, deadline: 1, createdAt: -1 })
        .limit(MAX_LIST_ITEMS);

    return [
        'Tarefas pendentes:',
        formatItems(
            pendingTasks,
            (task) => `${task.isImportant ? '!' : '-'} ${task.title}`,
            'Nenhuma tarefa pendente.'
        )
    ].join('\n');
}

async function getHabitsText(userId) {
    const habits = await habitModel.find({ userId });

    return [
        'Hábitos:',
        formatItems(
            habits.slice(0, MAX_LIST_ITEMS),
            (habit) => `${isCompletedToday(habit.lastCompleted) ? '[x]' : '[ ]'} ${habit.name} (${habit.streak || 0} dias)`,
            'Nenhum hábito cadastrado.'
        )
    ].join('\n');
}

async function getBriefingText(userId) {
    const [todayText, tasksText, habitsText] = await Promise.all([
        getTodayPlanText(userId),
        getPendingTasksText(userId),
        getHabitsText(userId)
    ]);

    return [
        'Resumo de hoje',
        '',
        todayText,
        '',
        tasksText,
        '',
        habitsText
    ].join('\n');
}

async function linkTelegramAccount({ chatId, args, firstName }) {
    const code = args.trim().toUpperCase();

    if (!code) {
        return {
            success: false,
            text: 'Envie o código assim: /link CODIGO'
        };
    }

    const link = await telegramLinkModel.findOne({
        code,
        status: 'pending',
        expiresAt: { $gt: new Date() }
    });

    if (!link) {
        return {
            success: false,
            text: 'Código inválido ou expirado. Gere um novo código no OrkestOS.'
        };
    }

    link.telegramChatId = String(chatId);
    link.telegramFirstName = firstName || '';
    link.status = 'linked';
    link.linkedAt = new Date();
    await link.save();

    return {
        success: true,
        text: 'Telegram vinculado ao OrkestOS. Use /briefing para ver seu resumo.'
    };
}

async function createTaskFromTelegram(userId, args) {
    const normalizedArgs = args.trim();
    const prefix = 'tarefa ';

    if (!normalizedArgs.toLowerCase().startsWith(prefix)) {
        return {
            success: false,
            text: 'Para criar tarefa, use: /add tarefa TITULO'
        };
    }

    const title = normalizedArgs.slice(prefix.length).trim();

    if (!title) {
        return {
            success: false,
            text: 'Informe o título da tarefa. Exemplo: /add tarefa Revisar contrato'
        };
    }

    const task = new taskModel({
        userId,
        title,
        completed: false,
        createdFrom: 'telegram'
    });

    await task.save();

    return {
        success: true,
        text: `Tarefa adicionada: ${title}`
    };
}

async function handleTelegramCommand({ chatId, text, firstName = '' }) {
    const { command, args } = parseTelegramCommand(text);

    if (command === 'start' || command === 'help' || !command) {
        return { success: true, text: HELP_TEXT };
    }

    if (command === 'link') {
        return linkTelegramAccount({ chatId, args, firstName });
    }

    const linkedAccount = await findLinkedAccount(chatId);
    if (!linkedAccount) {
        return { success: false, text: needsLinkedAccountText() };
    }

    if (command === 'hoje') {
        return { success: true, text: await getTodayPlanText(linkedAccount.userId) };
    }

    if (command === 'tarefas') {
        return { success: true, text: await getPendingTasksText(linkedAccount.userId) };
    }

    if (command === 'habitos') {
        return { success: true, text: await getHabitsText(linkedAccount.userId) };
    }

    if (command === 'briefing') {
        return { success: true, text: await getBriefingText(linkedAccount.userId) };
    }

    if (command === 'add') {
        return createTaskFromTelegram(linkedAccount.userId, args);
    }

    return { success: true, text: HELP_TEXT };
}

async function sendTelegramMessage(chatId, text) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        return {
            success: true,
            dryRun: true,
            chatId: String(chatId),
            text
        };
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true
        })
    });

    const payload = await response.json();

    return {
        success: response.ok,
        payload
    };
}

async function sendDailyBriefings({ sendMessage = sendTelegramMessage } = {}) {
    const linkedAccounts = await telegramLinkModel.find({
        status: 'linked',
        telegramChatId: { $ne: null }
    });

    const results = [];

    for (const account of linkedAccounts) {
        const text = await getBriefingText(account.userId);
        const result = await sendMessage(account.telegramChatId, text);

        results.push({
            chatId: String(account.telegramChatId),
            success: result.success === true,
            result
        });
    }

    return {
        success: true,
        sent: results.filter((result) => result.success).length,
        total: linkedAccounts.length,
        results
    };
}

export {
    createTelegramLinkCode,
    handleTelegramCommand,
    parseTelegramCommand,
    sendDailyBriefings,
    sendTelegramMessage
};
