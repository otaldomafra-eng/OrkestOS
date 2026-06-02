import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

import {
    createTelegramLinkCode,
    handleTelegramCommand,
    parseTelegramCommand,
    sendDailyBriefings
} from '../services/telegramCommandService.js';
import telegramLinkModel from '../models/telegramLinkModel.js';
import taskModel from '../models/taskModel.js';
import habitModel from '../models/habitModel.js';
import dailyPlanModel from '../models/dailyPlanModel.js';

const originals = [];

function replaceProperty(target, property, value) {
    originals.push([target, property, target[property]]);
    target[property] = value;
}

afterEach(() => {
    while (originals.length) {
        const [target, property, value] = originals.pop();
        target[property] = value;
    }
});

test('parseTelegramCommand normalizes slash commands and arguments', () => {
    assert.deepEqual(parseTelegramCommand('/add tarefa Revisar proposta'), {
        command: 'add',
        args: 'tarefa Revisar proposta'
    });
});

test('createTelegramLinkCode saves a short expiring code for a user', async () => {
    let savedLink;
    replaceProperty(telegramLinkModel, 'deleteMany', async () => ({ acknowledged: true }));
    replaceProperty(telegramLinkModel.prototype, 'save', async function save() {
        savedLink = this;
        return this;
    });

    const result = await createTelegramLinkCode('507f1f77bcf86cd799439011');

    assert.equal(result.success, true);
    assert.match(result.code, /^[A-Z0-9]{8}$/);
    assert.equal(savedLink.userId.toString(), '507f1f77bcf86cd799439011');
    assert.equal(savedLink.status, 'pending');
    assert.ok(savedLink.expiresAt > new Date());
});

test('handleTelegramCommand links a chat when a valid code is provided', async () => {
    const link = {
        userId: 'user-1',
        code: 'ABCD1234',
        status: 'pending',
        expiresAt: new Date(Date.now() + 60_000),
        saveCalled: false,
        async save() {
            this.saveCalled = true;
            return this;
        }
    };

    replaceProperty(telegramLinkModel, 'findOne', async () => link);

    const result = await handleTelegramCommand({
        chatId: 123,
        text: '/link ABCD1234',
        firstName: 'Maria'
    });

    assert.equal(result.success, true);
    assert.equal(result.text, 'Telegram vinculado ao OrkestOS. Use /briefing para ver seu resumo.');
    assert.equal(link.telegramChatId, '123');
    assert.equal(link.telegramFirstName, 'Maria');
    assert.equal(link.status, 'linked');
    assert.equal(link.saveCalled, true);
});

test('handleTelegramCommand builds a Portuguese briefing for a linked chat', async () => {
    replaceProperty(telegramLinkModel, 'findOne', async () => ({ userId: 'user-1', status: 'linked' }));
    replaceProperty(dailyPlanModel, 'findOne', async () => ({
        plannedTasks: [
            { title: 'Planejar semana', completed: false, isImportant: true },
            { title: 'Enviar relatório', completed: true, isImportant: false }
        ]
    }));
    replaceProperty(taskModel, 'find', () => ({
        sort: () => ({
            limit: async () => [
                { title: 'Comprar material', isImportant: true, completed: false }
            ]
        })
    }));
    replaceProperty(habitModel, 'find', async () => [
        { name: 'Beber água', streak: 3, lastCompleted: null }
    ]);

    const result = await handleTelegramCommand({
        chatId: 123,
        text: '/briefing'
    });

    assert.equal(result.success, true);
    assert.match(result.text, /Resumo de hoje/);
    assert.match(result.text, /Planejar semana/);
    assert.match(result.text, /Comprar material/);
    assert.match(result.text, /Beber água/);
});

test('handleTelegramCommand creates a task from /add tarefa', async () => {
    replaceProperty(telegramLinkModel, 'findOne', async () => ({ userId: '507f1f77bcf86cd799439011', status: 'linked' }));

    let savedTask;
    replaceProperty(taskModel.prototype, 'save', async function save() {
        savedTask = this;
        return this;
    });

    const result = await handleTelegramCommand({
        chatId: 123,
        text: '/add tarefa Ligar para cliente'
    });

    assert.equal(result.success, true);
    assert.equal(result.text, 'Tarefa adicionada: Ligar para cliente');
    assert.equal(savedTask.title, 'Ligar para cliente');
    assert.equal(savedTask.createdFrom, 'telegram');
});

test('sendDailyBriefings sends a briefing to every linked Telegram chat', async () => {
    const sentMessages = [];

    replaceProperty(telegramLinkModel, 'find', async () => [
        { userId: 'user-1', telegramChatId: '111', status: 'linked' },
        { userId: 'user-2', telegramChatId: '222', status: 'linked' }
    ]);
    replaceProperty(dailyPlanModel, 'findOne', async ({ userId }) => ({
        plannedTasks: [
            { title: `Plano ${userId}`, completed: false, isImportant: true }
        ]
    }));
    replaceProperty(taskModel, 'find', () => ({
        sort: () => ({
            limit: async () => []
        })
    }));
    replaceProperty(habitModel, 'find', async () => []);

    const result = await sendDailyBriefings({
        sendMessage: async (chatId, text) => {
            sentMessages.push({ chatId, text });
            return { success: true };
        }
    });

    assert.equal(result.success, true);
    assert.equal(result.sent, 2);
    assert.deepEqual(sentMessages.map((message) => message.chatId), ['111', '222']);
    assert.match(sentMessages[0].text, /Resumo de hoje/);
    assert.match(sentMessages[1].text, /Plano user-2/);
});
