import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { menuItemService } from './menuItem.service';

const createMenuItem = catchAsync(async (req: any, res: any) => {
  const result = await menuItemService.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'MenuItem created successfully',
    data: result,
  });
});

const getMenuItemList = catchAsync(async (req: any, res: any) => {
  const result = await menuItemService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MenuItem list retrieved successfully',
    data: result,
  });
});

const getMenuItemById = catchAsync(async (req: any, res: any) => {
  const result = await menuItemService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MenuItem details retrieved successfully',
    data: result,
  });
});

const updateMenuItem = catchAsync(async (req: any, res: any) => {
  const result = await menuItemService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MenuItem updated successfully',
    data: result,
  });
});

const toggleMenuItemStock = catchAsync(async (req: any, res: any) => {
  const result = await menuItemService.toggleStockIntoDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Menu item stock toggled successfully',
    data: result,
  });
});

const deleteMenuItem = catchAsync(async (req: any, res: any) => {
  const result = await menuItemService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MenuItem deleted successfully',
    data: result,
  });
});

export const menuItemController = {
  createMenuItem,
  getMenuItemList,
  getMenuItemById,
  updateMenuItem,
  toggleMenuItemStock,
  deleteMenuItem,
};