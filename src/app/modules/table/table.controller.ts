import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { tableService } from './table.service';

const createTable = catchAsync(async (req: any, res: any) => {
  const result = await tableService.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Table created successfully',
    data: result,
  });
});

const getTableList = catchAsync(async (req: any, res: any) => {
  const result = await tableService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Table list retrieved successfully',
    data: result,
  });
});

const getTableById = catchAsync(async (req: any, res: any) => {
  const result = await tableService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Table details retrieved successfully',
    data: result,
  });
});

const updateTable = catchAsync(async (req: any, res: any) => {
  const result = await tableService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Table updated successfully',
    data: result,
  });
});

const updateTableStatus = catchAsync(async (req: any, res: any) => {
  const result = await tableService.updateStatusIntoDb(req.params.id, req.body.status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Table status updated successfully',
    data: result,
  });
});

const deleteTable = catchAsync(async (req: any, res: any) => {
  const result = await tableService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Table deleted successfully',
    data: result,
  });
});

export const tableController = {
  createTable,
  getTableList,
  getTableById,
  updateTable,
  updateTableStatus,
  deleteTable,
};