import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { orderService } from './order.service';

const createOrder = catchAsync(async (req: any, res: any) => {
  const result = await orderService.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getOrderList = catchAsync(async (req: any, res: any) => {
  const result = await orderService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order list retrieved successfully',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: any, res: any) => {
  const result = await orderService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order details retrieved successfully',
    data: result,
  });
});

const updateOrder = catchAsync(async (req: any, res: any) => {
  const result = await orderService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order updated successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: any, res: any) => {
  const result = await orderService.updateStatusIntoDb(req.params.id, req.body.status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

const advanceOrderStatus = catchAsync(async (req: any, res: any) => {
  const result = await orderService.advanceStatusIntoDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status advanced successfully',
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: any, res: any) => {
  const result = await orderService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order deleted successfully',
    data: result,
  });
});

export const orderController = {
  createOrder,
  getOrderList,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  advanceOrderStatus,
  deleteOrder,
};