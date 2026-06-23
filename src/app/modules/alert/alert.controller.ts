import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { alertService } from './alert.service';

const createAlert = catchAsync(async (req: any, res: any) => {
  const result = await alertService.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Alert created successfully',
    data: result,
  });
});

const getAlertList = catchAsync(async (req: any, res: any) => {
  const result = await alertService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Alert list retrieved successfully',
    data: result,
  });
});

const getAlertById = catchAsync(async (req: any, res: any) => {
  const result = await alertService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Alert details retrieved successfully',
    data: result,
  });
});

const updateAlert = catchAsync(async (req: any, res: any) => {
  const result = await alertService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Alert updated successfully',
    data: result,
  });
});

const resolveAlert = catchAsync(async (req: any, res: any) => {
  const result = await alertService.resolveAlertIntoDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Alert resolved successfully',
    data: result,
  });
});

const deleteAlert = catchAsync(async (req: any, res: any) => {
  const result = await alertService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Alert deleted successfully',
    data: result,
  });
});

export const alertController = {
  createAlert,
  getAlertList,
  getAlertById,
  updateAlert,
  resolveAlert,
  deleteAlert,
};