import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { menuItemController } from './menuItem.controller';
import { menuItemValidation } from './menuItem.validation';

const router = express.Router();

router.post(
'/',
auth(),
validateRequest(menuItemValidation.createSchema),
menuItemController.createMenuItem,
);

router.get('/', auth(), menuItemController.getMenuItemList);

router.get('/:id', auth(), menuItemController.getMenuItemById);

router.put(
'/:id',
auth(),
validateRequest(menuItemValidation.updateSchema),
menuItemController.updateMenuItem,
);

router.patch(
  '/:id/toggle-stock',
  auth(),
  menuItemController.toggleMenuItemStock,
);

router.delete('/:id', auth(), menuItemController.deleteMenuItem);

export const menuItemRoutes = router;