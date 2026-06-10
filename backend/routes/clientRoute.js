import express from 'express';
import authUser from '../middlewares/auth.js';
import { listClients, createClient, updateClient, deleteClient } from '../controllers/clientController.js';

const clientRouter = express.Router();
clientRouter.use(authUser);

clientRouter.get('/list', listClients);
clientRouter.post('/create', createClient);
clientRouter.post('/update', updateClient);
clientRouter.post('/delete', deleteClient);

export default clientRouter;
