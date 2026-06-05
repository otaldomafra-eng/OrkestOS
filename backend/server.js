import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoute.js';
import goalRouter from './routes/goalRoute.js';
import projectRouter from './routes/projectRoute.js';
import taskRouter from './routes/taskRoute.js';
import habitRouter from './routes/habitRoute.js';
import dailyPlanRouter from './routes/dailyPlanRoute.js';
import notebookRouter from './routes/notebookRoute.js';
import pageRouter from './routes/pageRoute.js';
import weeklyStatRouter from './routes/weeklyStatRoute.js';
import telegramRouter from './routes/telegramRoute.js';
import futureTwinRouter from './routes/futuretwinRoute.js';
import { globalErrorHandler } from './utils/errorHandler.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
});

// API Endpoints
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);
app.use('/api/user', userRouter);
app.use('/api/goals', goalRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/habits', habitRouter);
app.use('/api/daily-plan', dailyPlanRouter);
app.use('/api/notebooks', notebookRouter);
app.use('/api/pages', pageRouter);
app.use('/api/stats', weeklyStatRouter);
app.use('/api/telegram', telegramRouter);
app.use('/api/futuretwin', futureTwinRouter);



app.get('/', (req, res)=>{
    res.send("OrkestOS API v1.0");
})

app.use(globalErrorHandler);

app.listen(port, ()=>{
    console.log(`Server running : http://localhost:${port}`);
})

