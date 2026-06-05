import goalModel from '../models/goalModel.js';
import taskModel from '../models/taskModel.js';
import asyncHandler from '../utils/asyncHandler.js';

// Criar meta
const createGoal = asyncHandler(async (req, res) => {
    const { title, type, description, deadline } = req.body;
    const userId = req.user.id;

    if (!title) {
        return res.json({ success: false, message: 'Title is required' });
    }

    const newGoal = new goalModel({
        userId,
        title,
        type: type || 'personal',
        description: description || '',
        deadline: deadline || null
    });

    await newGoal.save();
    res.json({ success: true, goal: newGoal, message: 'Goal Created Successfully !' });
});

// Get All Goals
const getGoals = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const goals = await goalModel.find({ userId });

    // Calculate progress dynamically for each goal
    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
        const goalTasks = await taskModel.find({ userId, goalId: goal._id });
        const completedTasks = goalTasks.filter(task => task.completed).length;
        const progress = goalTasks.length > 0 ? Math.round((completedTasks / goalTasks.length) * 100) : 0;

        return {
            ...goal.toObject(),
            progress
        };
    }));

    res.json({ success: true, goals: goalsWithProgress });
});

// Update Goal
const updateGoal = asyncHandler(async (req, res) => {
    const { goalId, title, type, description, deadline } = req.body;
    const userId = req.user.id;

    if (!goalId) {
        return res.json({ success: false, message: 'Goal ID is required' });
    }

    const goal = await goalModel.findOne({ _id: goalId, userId });
    if (!goal) {
        return res.json({ success: false, message: 'Goal not found' });
    }

    if (title) goal.title = title;
    if (type) goal.type = type;
    if (description !== undefined) goal.description = description;
    if (deadline !== undefined) goal.deadline = deadline;

    await goal.save();
    res.json({ success: true, goal, message: 'Goal updated Successfully' });
});

// Delete Goal
const deleteGoal = asyncHandler(async (req, res) => {
    const { goalId } = req.body;
    const userId = req.user.id;

    if (!goalId) {
        return res.json({ success: false, message: 'Goal ID is required' });
    }

    const goal = await goalModel.findOneAndDelete({ _id: goalId, userId });
    if (!goal) {
        return res.json({ success: false, message: 'Goal not found' });
    }

    res.json({ success: true, message: 'Meta excluida com sucesso' });
});

export { createGoal, getGoals, updateGoal, deleteGoal };
