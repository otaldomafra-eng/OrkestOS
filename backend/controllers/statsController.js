import dailyStatsModel from '../models/dailyStatsModel.js';
import asyncHandler from '../utils/asyncHandler.js';

// SAVE TODAY'S STATS
const saveDailyStats = asyncHandler(async (req, res) => {
  const { productivity, discipline } = req.body;
  const userId = req.user.id;

  if (productivity === undefined || discipline === undefined) {
    return res.json({ success: false, message: 'Scores are required' });
  }

  // Normalize date (IMPORTANT for unique index)
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  await dailyStatsModel.findOneAndUpdate(
    {
      userId,
      date: { $gte: start, $lte: end }
    },
    {
      productivity,
      discipline,
      date: start // always save normalized
    },
    {
      upsert: true,
      new: true
    }
  );

  res.json({ success: true });
});


// GET LAST 7 DAYS STATS
const getWeeklyStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await dailyStatsModel
    .find({ userId })
    .sort({ date: 1 }); // oldest → newest

  res.json({ success: true, data: stats });
});


export { saveDailyStats, getWeeklyStats };
