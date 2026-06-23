import express from 'express';
import auth from '../../middlewares/auth';
import { dashboardController } from './dashboard.controller';

const router = express.Router();

router.get('/summary', auth(), dashboardController.getDashboardSummary);

export const dashboardRoutes = router;
