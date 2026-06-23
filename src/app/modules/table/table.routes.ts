import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { tableController } from './table.controller';
import { tableValidation } from './table.validation';

const router = express.Router();

router.post(
'/',
auth(),
validateRequest(tableValidation.createSchema),
tableController.createTable,
);

router.get('/', auth(), tableController.getTableList);

router.get('/:id', auth(), tableController.getTableById);

router.put(
'/:id',
auth(),
validateRequest(tableValidation.updateSchema),
tableController.updateTable,
);

router.patch(
  '/:id/status',
  auth(),
  tableController.updateTableStatus,
);

router.delete('/:id', auth(), tableController.deleteTable);

export const tableRoutes = router;