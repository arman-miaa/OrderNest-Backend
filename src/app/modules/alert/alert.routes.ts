import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { alertController } from './alert.controller';
import { alertValidation } from './alert.validation';

const router = express.Router();

router.post(
'/',
auth(),
validateRequest(alertValidation.createSchema),
alertController.createAlert,
);

router.get('/', auth(), alertController.getAlertList);

router.get('/:id', auth(), alertController.getAlertById);

router.put(
'/:id',
auth(),
validateRequest(alertValidation.updateSchema),
alertController.updateAlert,
);

router.patch('/:id/resolve', auth(), alertController.resolveAlert);

router.delete('/:id', auth(), alertController.deleteAlert);

export const alertRoutes = router;