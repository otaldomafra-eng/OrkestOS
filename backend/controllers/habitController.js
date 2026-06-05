import habitModel from '../models/habitModel.js';
import dailyPlanModel from '../models/dailyPlanModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getTodayStr, isCompletedToday } from '../utils/dateUtils.js';

// Helper function for streak logic
const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const compareDate = new Date(date);
    return yesterday.toISOString().split('T')[0] === compareDate.toISOString().split('T')[0];
};

// Criar hábito
const createHabit = asyncHandler(async (req, res) => {
    const { name, type, startTime, endTime, mode } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.json({ success: false, message: 'Habit name is required' });
    }

    const newHabit = new habitModel({
        userId,
        name,
        type: type || 'daily',
        startTime: startTime || null,
        endTime: endTime || null,
        streak: 0,
        mode: mode || '21-day',
        lastCompleted: null
    });

    await newHabit.save();
    res.json({ success: true, habit: newHabit, message: 'Habit created Successfully !' });
});

// Get All Habits
const getHabits = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const habits = await habitModel.find({ userId });
    res.json({ success: true, habits });
});

// Update Habit
const updateHabit = asyncHandler(async (req, res) => {
    const { habitId, name, type, startTime, endTime, mode } = req.body;
    const userId = req.user.id;

    if (!habitId) {
        return res.json({ success: false, message: 'Habit ID is required' });
    }

    const habit = await habitModel.findOne({ _id: habitId, userId });
    if (!habit) {
        return res.json({ success: false, message: 'Habit not found' });
    }

    if (name) habit.name = name;
    if (type) habit.type = type;
    if (startTime !== undefined) habit.startTime = startTime;
    if (endTime !== undefined) habit.endTime = endTime;
    if (mode) habit.mode = mode;

    await habit.save();
    res.json({ success: true, habit, message: 'Habit Updated Successfully' });
});

const completeHabit = asyncHandler(async (req, res) => {
    const { habitId } = req.body;
    const userId = req.user.id;

    if (!habitId) {
        return res.json({ success: false, message: 'Habit ID is required' });
    }

    const habit = await habitModel.findOne({ _id: habitId, userId });
    if (!habit) {
        return res.json({ success: false, message: 'Habit not found' });
    }

    const today = new Date();
    const todayStr = getTodayStr();

    // =============================
    // TOGGLE OFF (UNDO)
    // =============================
    if (isCompletedToday(habit.lastCompleted)) {

        // Decrease streak safely
        habit.streak = habit.streak > 0 ? habit.streak - 1 : 0;

        // Set lastCompleted to yesterday or null
        if (habit.streak === 0) {
            habit.lastCompleted = null;
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            habit.lastCompleted = yesterday;
        }

        await habit.save();

        // Sync DailyPlan
        const dailyPlan = await dailyPlanModel.findOne({ userId, date: todayStr });
        if (dailyPlan) {
            const plannedHabit = dailyPlan.plannedTasks.find(pt =>
                pt.source === 'habit' &&
                pt.habitId &&
                pt.habitId.toString() === habitId
            );

            if (plannedHabit) {
                plannedHabit.completed = false;
                await dailyPlan.save();
            }
        }

        return res.json({
            success: true,
            habit,
            message: 'Habit unmarked (undo successful)'
        });
    }

    // =============================
    // TOGGLE ON (COMPLETE)
    // =============================

    if (habit.lastCompleted && isYesterday(habit.lastCompleted)) {
        habit.streak += 1;
    } else {
        habit.streak = 1;
    }

    habit.lastCompleted = today;
    await habit.save();

    // Sync DailyPlan
    const dailyPlan = await dailyPlanModel.findOne({ userId, date: todayStr });

    if (dailyPlan) {
        const plannedHabit = dailyPlan.plannedTasks.find(pt =>
            pt.source === 'habit' &&
            pt.habitId &&
            pt.habitId.toString() === habitId
        );

        if (plannedHabit) {
            plannedHabit.completed = true;
            await dailyPlan.save();
        }
    }

    return res.json({
        success: true,
        habit,
        message: 'Hábito concluido com sucesso'
    });
});

// Delete Habit
const deleteHabit = asyncHandler(async (req, res) => {
    const { habitId } = req.body;
    const userId = req.user.id;

    if (!habitId) {
        return res.json({ success: false, message: 'Habit ID is required' });
    }

    const habit = await habitModel.findOneAndDelete({ _id: habitId, userId });
    if (!habit) {
        return res.json({ success: false, message: 'Habit not found' });
    }

    // Remove from DailyPlan if exists
    await dailyPlanModel.updateMany(
        { userId },
        { $pull: { plannedTasks: { habitId: habitId } } }
    );

    res.json({ success: true, message: 'Hábito excluido com sucesso' });
});

export { createHabit, getHabits, updateHabit, completeHabit, deleteHabit };
