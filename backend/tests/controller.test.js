import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { createGoal, getGoals } from '../controllers/goalController.js';
import { toggleTaskCompletion } from '../controllers/taskController.js';
import { createHabit, getHabits, updateHabit, completeHabit, deleteHabit } from '../controllers/habitController.js';
import { createProject, getProjects, updateProject, deleteProject } from '../controllers/projectController.js';
import { createNotebook, getNotebooks, updateNotebook, deleteNotebook } from '../controllers/notebookController.js';
import { saveDailyStats, getWeeklyStats } from '../controllers/statsController.js';
import { loginUser } from '../controllers/userController.js';
import authUser from '../middlewares/auth.js';
import dailyPlanModel from '../models/dailyPlanModel.js';
import goalModel from '../models/goalModel.js';
import taskModel from '../models/taskModel.js';
import habitModel from '../models/habitModel.js';
import projectModel from '../models/projectModel.js';
import notebookModel from '../models/notebookModel.js';
import pageModel from '../models/pageModel.js';
import dailyStatsModel from '../models/dailyStatsModel.js';
import userModel from '../models/userModel.js';

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

// ==========================================
// HABIT CONTROLLER TESTS
// ==========================================

test('createHabit validates that name is required', async () => {
    const res = mockResponse();

    await createHabit({ body: {}, user: { id: 'user-1' } }, res, () => {});

    assert.deepEqual(res.body, {
        success: false,
        message: 'Habit name is required'
    });
});

test('createHabit saves habit with defaults', async () => {
    const res = mockResponse();
    let savedHabit;
    replaceProperty(habitModel.prototype, 'save', async function save() {
        savedHabit = this;
        return this;
    });

    await createHabit({
        body: { name: 'Morning Run' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(savedHabit.name, 'Morning Run');
    assert.equal(savedHabit.type, 'daily');
    assert.equal(savedHabit.mode, '21-day');
    assert.equal(savedHabit.streak, 0);
});

test('getHabits returns habits for user', async () => {
    const res = mockResponse();
    const habits = [
        { id: 'h1', name: 'Run', streak: 5 },
        { id: 'h2', name: 'Read', streak: 3 }
    ];

    replaceProperty(habitModel, 'find', async () => habits);

    await getHabits({ user: { id: 'user-1' } }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(res.body.habits.length, 2);
});

test('completeHabit increments streak when not completed today', async () => {
    const res = mockResponse();
    const habit = {
        _id: 'habit-1',
        streak: 0,
        lastCompleted: null,
        saveCalled: false,
        async save() {
            this.saveCalled = true;
        }
    };

    replaceProperty(habitModel, 'findOne', async () => habit);
    replaceProperty(dailyPlanModel, 'findOne', async () => null);

    await completeHabit({
        body: { habitId: 'habit-1' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(habit.streak, 1);
    assert.equal(habit.saveCalled, true);
});

test('deleteHabit removes habit and cleans up daily plan', async () => {
    const res = mockResponse();
    const habit = { _id: 'habit-1' };

    replaceProperty(habitModel, 'findOneAndDelete', async () => habit);
    replaceProperty(dailyPlanModel, 'updateMany', async () => null);

    await deleteHabit({
        body: { habitId: 'habit-1' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Hábito excluido com sucesso');
});

// ==========================================
// PROJECT CONTROLLER TESTS
// ==========================================

test('createProject validates title is required', async () => {
    const res = mockResponse();

    await createProject({ body: {}, user: { id: 'user-1' } }, res, () => {});

    assert.deepEqual(res.body, {
        success: false,
        message: 'Title is required'
    });
});

test('createProject saves project with defaults', async () => {
    const res = mockResponse();
    let savedProject;
    replaceProperty(projectModel.prototype, 'save', async function save() {
        savedProject = this;
        return this;
    });

    await createProject({
        body: { title: 'Website Redesign' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(savedProject.title, 'Website Redesign');
    assert.equal(savedProject.goalId, null);
    assert.equal(savedProject.description, '');
});

test('getProjects calculates progress for each project', async () => {
    const res = mockResponse();
    const projects = [
        { _id: 'proj-1', title: 'Project 1', toObject: () => ({ _id: 'proj-1', title: 'Project 1' }) }
    ];

    replaceProperty(projectModel, 'find', async () => projects);
    replaceProperty(taskModel, 'find', async () => [
        { completed: true },
        { completed: false }
    ]);

    await getProjects({ user: { id: 'user-1' } }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(res.body.projects[0].progress, 50);
    assert.equal(res.body.projects[0].tasksConcluido, 1);
    assert.equal(res.body.projects[0].totalTasks, 2);
});

test('deleteProject removes project', async () => {
    const res = mockResponse();

    replaceProperty(projectModel, 'findOneAndDelete', async () => ({ _id: 'proj-1' }));

    await deleteProject({
        body: { projectId: 'proj-1' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
});

// ==========================================
// NOTEBOOK CONTROLLER TESTS
// ==========================================

test('createNotebook validates name is required', async () => {
    const res = mockResponse();

    replaceProperty(notebookModel, 'countDocuments', async () => 0);

    await createNotebook({ body: {}, user: { id: 'user-1' } }, res, () => {});

    assert.deepEqual(res.body, {
        success: false,
        message: 'Nome obrigatório'
    });
});

test('createNotebook enforces max 40 notebooks limit', async () => {
    const res = mockResponse();

    replaceProperty(notebookModel, 'countDocuments', async () => 40);

    await createNotebook({
        body: { name: 'New Notebook' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.deepEqual(res.body, {
        success: false,
        message: 'Max 40 notebooks allowed'
    });
});

test('createNotebook saves notebook with order', async () => {
    const res = mockResponse();
    let savedNotebook;
    replaceProperty(notebookModel, 'countDocuments', async () => 2);
    replaceProperty(notebookModel.prototype, 'save', async function save() {
        savedNotebook = this;
        return this;
    });

    await createNotebook({
        body: { name: 'My Notes' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(savedNotebook.name, 'My Notes');
    assert.equal(savedNotebook.order, 3);
});

test('deleteNotebook cascades to pages', async () => {
    const res = mockResponse();
    let deleteManyCalled = false;
    let deletedNotebook = null;

    replaceProperty(notebookModel, 'findOneAndDelete', async () => ({ _id: 'nb-1' }));
    replaceProperty(pageModel, 'deleteMany', async function() {
        deleteManyCalled = true;
        return true;
    });

    await deleteNotebook({
        body: { notebookId: 'nb-1' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(deleteManyCalled, true);
});

// ==========================================
// STATS CONTROLLER TESTS
// ==========================================

test('saveDailyStats validates scores are provided', async () => {
    const res = mockResponse();

    await saveDailyStats({
        body: { productivity: 80 },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.deepEqual(res.body, {
        success: false,
        message: 'Scores are required'
    });
});

test('saveDailyStats saves or updates stats', async () => {
    const res = mockResponse();
    let findOneAndUpdateCalled = false;

    replaceProperty(dailyStatsModel, 'findOneAndUpdate', async () => {
        findOneAndUpdateCalled = true;
        return { userId: 'user-1', productivity: 85, discipline: 90 };
    });

    await saveDailyStats({
        body: { productivity: 85, discipline: 90 },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(findOneAndUpdateCalled, true);
});

test('getWeeklyStats returns stats for user', async () => {
    const res = mockResponse();
    const stats = [
        { date: '2026-06-01', productivity: 80, discipline: 85 },
        { date: '2026-06-02', productivity: 90, discipline: 88 }
    ];

    replaceProperty(dailyStatsModel, 'find', function() {
        return {
            sort: () => Promise.resolve(stats)
        };
    });

    await getWeeklyStats({ user: { id: 'user-1' } }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 2);
});

// ==========================================
// USER CONTROLLER TESTS
// ==========================================

test('loginUser validates user exists', async () => {
    const res = mockResponse();

    replaceProperty(userModel, 'findOne', async () => null);

    await loginUser({
        body: { identifier: 'unknown@email.com', password: 'pass' },
        user: { id: 'user-1' }
    }, res, () => {});

    assert.deepEqual(res.body, {
        success: false,
        message: 'Usuário não encontrado. Por favor, cadastre-se primeiro.'
    });
});

test('loginUser returns token on successful login', async () => {
    const res = mockResponse();
    const user = {
        _id: 'user-123',
        email: 'test@email.com',
        username: 'testuser',
        name: 'Test User',
        bio: 'Bio',
        profile_picture: 'pic.jpg',
        password: '$2b$12$hash' // hashed password
    };

    replaceProperty(userModel, 'findOne', async () => user);
    replaceProperty(bcrypt, 'compare', async () => true);

    await loginUser({
        body: { identifier: 'testuser', password: 'correctpassword' }
    }, res, () => {});

    assert.equal(res.body.success, true);
    assert.equal(res.body.email, 'test@email.com');
    assert(res.body.token);
});
