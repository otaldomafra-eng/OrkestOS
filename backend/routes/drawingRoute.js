import express from 'express';
import authUser from '../middlewares/auth.js';
import { listDrawings, createDrawing, updateDrawing, deleteDrawing, addRevision } from '../controllers/drawingController.js';

const drawingRouter = express.Router();
drawingRouter.use(authUser);

drawingRouter.get('/list', listDrawings);
drawingRouter.post('/create', createDrawing);
drawingRouter.post('/update', updateDrawing);
drawingRouter.post('/delete', deleteDrawing);
drawingRouter.post('/add-revision', addRevision);

export default drawingRouter;
