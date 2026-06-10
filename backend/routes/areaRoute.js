import express from 'express';
import authUser from '../middlewares/auth.js';
import { listAreas, createArea, updateArea, deleteArea, reorderAreas } from '../controllers/areaController.js';

const areaRouter = express.Router();

areaRouter.use(authUser);

areaRouter.get('/list', listAreas);
areaRouter.post('/create', createArea);
areaRouter.post('/update', updateArea);
areaRouter.post('/delete', deleteArea);
areaRouter.post('/reorder', reorderAreas);

export default areaRouter;
