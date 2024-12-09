import express from 'express';
const router = express.Router();

import AppController  from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);


export default router;
