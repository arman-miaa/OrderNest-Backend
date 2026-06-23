import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { orderController } from './order.controller';
import { orderValidation } from './order.validation';

const router = express.Router();

router.post(
'/',
auth(),
validateRequest(orderValidation.createSchema),
orderController.createOrder,
);

router.get('/', auth(), orderController.getOrderList);

router.get('/:id', auth(), orderController.getOrderById);

router.put(
'/:id',
auth(),
validateRequest(orderValidation.updateSchema),
orderController.updateOrder,
);

router.patch('/:id/status', auth(), orderController.updateOrderStatus);
router.patch('/:id/advance-status', auth(), orderController.advanceOrderStatus);

router.delete('/:id', auth(), orderController.deleteOrder);

export const orderRoutes = router;