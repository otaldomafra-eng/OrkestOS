import taskModel from '../models/taskModel.js';
import dailyPlanModel from '../models/dailyPlanModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getTodayStr } from '../utils/dateUtils.js';

// Create Task
const createTask = asyncHandler(async (req, res) => {
    const { title, goalId, projectId, isImportant, deadline, createdFrom } = req.body;
    const userId = req.user.id;

    if (!title) {
        return res.json({ success: false, message: 'Title is required' });
    }

    const newTask = new taskModel({
        userId,
        title,
        completed: false,
        goalId: goalId || null,
        projectId: projectId || null,
        isImportant: isImportant || false,
        deadline: deadline || null,
        createdFrom: createdFrom || 'manual'
    });

    await newTask.save();
    res.json({ success: true, task: newTask, message: 'Task Created Successfully !' });
});

// Get All Tasks
const getTasks = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const tasks = await taskModel.find({ userId });
    res.json({ success: true, tasks });
});

// Update Task
const updateTask = asyncHandler(async (req, res) => {
    const { taskId, title, goalId, projectId, isImportant, deadline, completed } = req.body;
    const userId = req.user.id;

    if (!taskId) {
        return res.json({ success: false, message: 'Task ID is required' });
    }

    const task = await taskModel.findOne({ _id: taskId, userId });
    if (!task) {
        return res.json({ success: false, message: 'Task not found' });
    }

    if (title) task.title = title;
    if (goalId !== undefined) task.goalId = goalId;
    if (projectId !== undefined) task.projectId = projectId;
    if (isImportant !== undefined) task.isImportant = isImportant;
    if (deadline !== undefined) task.deadline = deadline;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    res.json({ success: true, task, message: 'Task Updated !' });
});

// Toggle Task Completion (SSOT - Updates Task first, then DailyPlan)
const toggleTaskCompletion = asyncHandler(async (req, res) => {
    const { taskId } = req.body;
    const userId = req.user.id;

    if (!taskId) {
        return res.json({ success: false, message: 'Task ID is required' });
    }

    // SOURCE OF TRUTH: Update Task first
    const task = await taskModel.findOne({ _id: taskId, userId });
    if (!task) {
        return res.json({ success: false, message: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();

    // SYNC: Update in DailyPlan if exists
    const today = getTodayStr();
    const dailyPlan = await dailyPlanModel.findOne({ userId, date: today });

    if (dailyPlan) {
        const plannedTask = dailyPlan.plannedTasks.find(pt =>
            pt.source === 'task' && pt.taskId && pt.taskId.toString() === taskId
        );

        if (plannedTask) {
            plannedTask.completed = task.completed;
            await dailyPlan.save();
        }
    }

    res.json({ success: true, task });
});

// Delete Task
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;
    const userId = req.user.id;

    if (!taskId) {
        return res.json({ success: false, message: 'Task ID is required' });
    }

    const task = await taskModel.findOneAndDelete({ _id: taskId, userId });
    if (!task) {
        return res.json({ success: false, message: 'Task not found' });
    }

    // Remove from DailyPlan if exists
    await dailyPlanModel.updateMany(
        { userId },
        { $pull: { plannedTasks: { taskId: taskId } } }
    );

    res.json({ success: true, message: 'Tarefa excluida com sucesso' });
});

export { createTask, getTasks, updateTask, toggleTaskCompletion, deleteTask };
