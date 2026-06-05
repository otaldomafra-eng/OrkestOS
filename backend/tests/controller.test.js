import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import jwt from 'jsonwebtoken';

import { createGoal, getGoals } from '../controllers/goalController.js';
import { toggleTaskCompletion } from '../controllers/taskController.js';
import authUser from '../middlewares/auth.js';
import dailyPlanModel from '../models/dailyPlanModel.js';
import goalModel from '../models/goalModel.js';
import taskModel from '../models/taskModel.js';

const originals = [];

function mockResponse() {
    return {
        body: undefined,
        json(payload) {
            this.body = payload;
            return payload;
        }
    };
}

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

test('createGoal returns a validation response when title is missing', async () => {
    const res = mockResponse();

    await createGoal({ body: {}, user: { id: 'user-1' } }, res, () => {});

    assert.deepEqual(res.body, {
        success: false,
        message: 'Title is required'
    });
});

test('createGoal persists default values for a valid goal', async () => {
    const res = mockResponse();
    let savedGoal;
    replaceProperty(goalModel.prototype, 'save', async function save() {
        savedGoal = this;
        return this;
    });

    await createGoal({
        body: { title: 'Ship open-source work' },
        user: { id: '507f1f77bcf86cd799439011' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Goal Created Successfully !');
    assert.equal(savedGoal.type, 'personal');
    assert.equal(savedGoal.description, '');
    assert.equal(savedGoal.deadline, null);
});

test('getGoals calculates progress from completed goal tasks', async () => {
    const res = mockResponse();
    const goal = {
        _id: 'goal-1',
        toObject: () => ({ _id: 'goal-1', title: 'Testing coverage' })
    };

    replaceProperty(goalModel, 'find', async () => [goal]);
    replaceProperty(taskModel, 'find', async () => [
        { completed: true },
        { completed: false },
        { completed: true }
    ]);

    await getGoals({ user: { id: 'user-1' } }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(res.body.goals[0].progress, 67);
});

test('toggleTaskCompletion updates task source of truth and daily plan mirror', async () => {
    const res = mockResponse();
    const task = {
        completed: false,
        saveCalled: false,
        async save() {
            this.saveCalled = true;
        }
    };
    const plannedTask = { source: 'task', taskId: { toString: () => 'task-1' }, completed: false };
    const dailyPlan = {
        plannedTasks: [plannedTask],
        saveCalled: false,
        async save() {
            this.saveCalled = true;
        }
    };

    replaceProperty(taskModel, 'findOne', async () => task);
    replaceProperty(dailyPlanModel, 'findOne', async () => dailyPlan);

    await toggleTaskCompletion({
        body: { taskId: 'task-1' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(task.completed, true);
    assert.equal(task.saveCalled, true);
    assert.equal(plannedTask.completed, true);
    assert.equal(dailyPlan.saveCalled, true);
});

test('authUser rejects requests without a token', async () => {
    const res = mockResponse();
    let nextCalled = false;

    await authUser({ headers: {} }, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.deepEqual(res.body, {
        success: false,
        message: 'Não autorizado. Faça login novamente.'
    });
});

test('authUser stores decoded user id and calls next for a valid token', async () => {
    const token = jwt.sign({ id: 'user-123' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    let nextCalled = false;

    await authUser(req, mockResponse(), () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, 'user-123');
});
