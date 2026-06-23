import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { UserService } from "./user.services";
import { fileUploader } from "../../../helpars/fileUploader";
import { UserRole, UserStatus } from "@prisma/client";

// get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await UserService.getMyProfile(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: result,
  });
});

// update user profile
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;
  const updateData = req.body.data ? JSON.parse(req.body.data) : req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  let imageUrl: string | undefined;

  if (files?.image?.[0]) {
    const uploaded = await fileUploader.uploadToDigitalOcean(files.image[0]);
    imageUrl = uploaded.Location;
  }

  const result = await UserService.updateUser(
    req.user.id,
    updateData,
    imageUrl
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

// ========== ORDER NEST: Create Staff or Kitchen ==========
const createStaff = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createStaffByManager(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `${req.body.role === "KITCHEN" ? "Kitchen display" : "Staff"} created successfully`,
    data: result,
  });
});

// ========== ORDER NEST: Get All Staff ==========
const getAllStaff = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    searchTerm: req.query.searchTerm as string,
    role: req.query.role as UserRole,
    shift: req.query.shift as string,
    status: req.query.status as UserStatus,
  };

  const options = {
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10),
    sortBy: (req.query.sortBy as string) || "createdAt",
    sortOrder: (req.query.sortOrder as string) || "desc",
  };

  const result = await UserService.getAllStaff(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Staff retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// ========== ORDER NEST: Get Single Staff ==========
const getSingleStaffById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getSingleStaff(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Staff details retrieved successfully",
    data: result,
  });
});

// ========== ORDER NEST: Update Staff ==========
const updateStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateStaffByManager(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Staff updated successfully",
    data: result,
  });
});

// ========== ORDER NEST: Toggle Staff Status ==========
const toggleStaffStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.toggleStaffStatus(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Staff ${result.status.toLowerCase()} successfully`,
    data: result,
  });
});

// ========== ORDER NEST: Delete Staff ==========
const deleteStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteStaffByManager(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Staff deleted successfully",
    data: result,
  });
});

// get single user by id (generic)
const getSingleUserById = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await UserService.getSingleUserById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User details retrieved successfully",
    data: result.data,
  });
});

// get all users (generic)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = { searchTerm: req.query.searchTerm as string, ...req.query };
  const filterData = { ...req.query };
  const excludeFields = ['page', 'limit', 'sortBy', 'sortOrder', 'searchTerm'];
  excludeFields.forEach(field => delete (filterData as any)[field]);
  const finalFilters = { searchTerm: req.query.searchTerm as string, ...filterData };

  const options = {
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10),
    sortBy: req.query.sortBy as string || 'createdAt',
    sortOrder: req.query.sortOrder as string || 'desc'
  };

  const result = await UserService.getAllUsers(finalFilters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// suspend or activate user
const suspendOrActivatedUser = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const status = Array.isArray(req.body.status)
    ? req.body.status[0]
    : req.body.status;
  const result = await UserService.suspendOrActivateUser(
    id,
    status as UserStatus
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

// delete user by admin
const removeUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await UserService.removeUserByAdmin(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User removed successfully",
    data: result,
  });
});

// change user role
const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.user.id) ? req.user.id[0] : req.user.id;
  const role = Array.isArray(req.body.role) ? req.body.role[0] : req.body.role;
  const result = await UserService.changeUserRole(userId, role as UserRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role changed successfully",
    data: result,
  });
});

export const UserController = {
  getMyProfile,
  updateUser,
  createStaff,         // ✅ Create Staff & Kitchen
  getAllStaff,         // ✅ Get all staff list
  getSingleStaffById,  // ✅ Get single staff detail
  updateStaff,         // ✅ Update staff info
  toggleStaffStatus,   // ✅ Active/Suspend toggle
  deleteStaff,         // ✅ Delete staff
  getSingleUserById,
  removeUserByAdmin,
  changeUserRole,
  getAllUsers,
  suspendOrActivatedUser,
};