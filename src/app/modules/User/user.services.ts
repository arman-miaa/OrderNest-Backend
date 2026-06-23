import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import * as bcrypt from "bcrypt";
import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import config from "../../../config";
import httpStatus from "http-status";
import { omit } from "lodash";
import { IUserFilters } from "./user.interface";
import emailSender from "../../../shared/brevoMailSender";
import { paginationHelper } from "../../../helpars/paginationHelper";

// get user profile
const getMyProfile = async (userId: string) => {
  const userProfile = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const userWithoutPassword = omit(userProfile, [
    "password",
    "otp",
    "otpExpiresAt",
  ]);

  return { ...userWithoutPassword, accountType: "FREE" };
};

//update user profile
const updateUser = async (
  userId: string,
  updateData: Partial<User>,
  imageUrl?: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const forbiddenFields = [
    "id",
    "role",
    "status",
    "otp",
    "otpExpiresAt",
    "createdAt",
    "updatedAt",
  ];
  const filteredUpdateData: Partial<User> = {};

  for (const [key, value] of Object.entries(updateData)) {
    if (
      !forbiddenFields.includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      filteredUpdateData[key as keyof User] = value as any;
    }
  }

  if (
    filteredUpdateData.email &&
    filteredUpdateData.email !== existingUser.email
  ) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email: filteredUpdateData.email,
        id: { not: userId },
      },
    });
    if (emailExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    }
  }

  if (filteredUpdateData.password) {
    filteredUpdateData.password = await bcrypt.hash(
      filteredUpdateData.password,
      Number(config.bcrypt_salt_rounds),
    );
  }

  if (imageUrl) {
    filteredUpdateData.profileImage = imageUrl;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: filteredUpdateData,
  });

  const userWithoutSensitive = omit(updatedUser, [
    "password",
    "fcmToken",
    "otp",
    "otpExpiresAt",
  ]);

  return userWithoutSensitive;
};

//get all users
const getAllUsers = async (filters: IUserFilters, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["fullName", "email"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const [result, total, totalUsers, totalActiveUsers, totalSuspendUsers] =
    await prisma.$transaction([
      prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          profileImage: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where: whereConditions }),
      prisma.user.count({ where: whereConditions }),
      prisma.user.count({
        where: { status: UserStatus.ACTIVE, ...whereConditions },
      }),
      prisma.user.count({
        where: { status: UserStatus.SUSPENDED, ...whereConditions },
      }),
    ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalUsers,
      totalActiveUsers,
      totalSuspendUsers,
    },
    data: result,
  };
};

//get single user
const getSingleUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    data: { ...user, password: "", otp: null, otpExpiresAt: null },
  };
};

// delete user by admin/manager
const removeUserByAdmin = async (id: string) => {
  const findUserToDelete = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!findUserToDelete) {
    throw new ApiError(httpStatus.NOT_FOUND, "User to delete not found");
  }

  const deletedUser = await prisma.user.delete({
    where: { id: id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Hello ${deletedUser.fullName || ""},</h2>
        <p>We're writing to let you know that an admin has <strong>removed your account</strong>.</p>
        <p>If you believe this was a mistake or you have any questions, please contact support.</p>
        <hr style="border:none;border-top:1px solid #eee; margin:16px 0;" />
        <p style="color:#6b7280; font-size:12px;">This mailbox is not monitored. Please reach out through the support portal for assistance.</p>
      </div>
    `;
    await emailSender(deletedUser.email, html, "Your Account Has Been Removed");
  } catch (error) {
    console.error("Failed to send removal email:", error);
  }

  return deletedUser;
};

// change user role
const changeUserRole = async (userId: string, role: UserRole) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  return updatedUser;
};

// suspend or activate user
const suspendOrActivateUser = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (status !== UserStatus.SUSPENDED && status !== UserStatus.ACTIVE) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid status: ${status}, status must be ${UserStatus.SUSPENDED} or ${UserStatus.ACTIVE}`,
    );
  }

  if (user.status === status) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `User is already ${status.toLowerCase()}`,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return updatedUser;
};

// ========== ORDER NEST: Create Staff or Kitchen by Manager ==========
const createStaffByManager = async (payload: {
  fullName: string;
  email: string;
  phone?: string;
  role: "STAFF" | "KITCHEN";
  pin: string;
  shift: string;
  device?: string;
}) => {
  // Check duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
  }

  // Kitchen: only 1 allowed
  if (payload.role === "KITCHEN") {
    const existingKitchen = await prisma.user.findFirst({
      where: { role: "KITCHEN" }
    });
    if (existingKitchen) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Kitchen account already exists. Only one kitchen display is allowed.");
    }
  }

  // Hash PIN as password
  const hashedPassword = await bcrypt.hash(
    payload.pin,
    Number(config.bcrypt_salt_rounds)
  );

  const newUser = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || "",
      password: hashedPassword,
      role: payload.role,
      pin: payload.pin,
      shift: payload.shift || (payload.role === "KITCHEN" ? "all-day" : "morning"),
      device: payload.device || (payload.role === "KITCHEN" ? "Wall Screen" : "Tablet-01"),
      status: "ACTIVE",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      pin: true,
      shift: true,
      device: true,
      status: true,
      createdAt: true,
    }
  });

  return newUser;
};

// ========== ORDER NEST: Get All Staff ==========
const getAllStaff = async (filters: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, role, shift, status } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  // Only STAFF and KITCHEN roles
  andConditions.push({
    role: { in: ["STAFF", "KITCHEN"] }
  });

  if (searchTerm) {
    andConditions.push({
      OR: ["fullName", "email"].map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" }
      }))
    });
  }

  if (role && (role === "STAFF" || role === "KITCHEN")) {
    andConditions.push({ role });
  }

 if (shift) {
    andConditions.push({
      shift: { equals: shift }  // ✅ Use equals instead of direct assignment
    } as any); // Prisma might not recognize custom field, use 'as any' if needed
  }

  if (status) {
    andConditions.push({ status });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const [result, total, staffCount, kitchenCount] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        pin: true,
        shift: true,
        device: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      }
    }),
    prisma.user.count({ where: whereConditions }),
    prisma.user.count({ where: { ...whereConditions, role: "STAFF" } }),
    prisma.user.count({ where: { ...whereConditions, role: "KITCHEN" } }),
  ]);

  return {
    meta: { total, page, limit, staffCount, kitchenCount },
    data: result,
  };
};

// ========== ORDER NEST: Get Single Staff ==========
const getSingleStaff = async (id: string) => {
  const staff = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      pin: true,
      shift: true,
      device: true,
      status: true,
      lastLogin: true,
      createdAt: true,
    }
  });

  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  }

  if (staff.role !== "STAFF" && staff.role !== "KITCHEN") {
    throw new ApiError(httpStatus.BAD_REQUEST, "This user is not a staff member");
  }

  return staff;
};

// ========== ORDER NEST: Update Staff by Manager ==========
const updateStaffByManager = async (id: string, payload: any) => {
  const staff = await prisma.user.findUnique({ where: { id } });

  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  }

  if (staff.role !== "STAFF" && staff.role !== "KITCHEN") {
    throw new ApiError(httpStatus.BAD_REQUEST, "This user is not a staff member");
  }

  // Check email uniqueness if changing
  if (payload.email && payload.email !== staff.email) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email: payload.email,
        id: { not: id },
      },
    });
    if (emailExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    }
  }

  // If PIN changed, re-hash
  if (payload.pin) {
    payload.password = await bcrypt.hash(
      payload.pin,
      Number(config.bcrypt_salt_rounds)
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      pin: true,
      shift: true,
      device: true,
      status: true,
    }
  });

  return updated;
};

// ========== ORDER NEST: Toggle Staff Status ==========
const toggleStaffStatus = async (id: string) => {
  const staff = await prisma.user.findUnique({ where: { id } });

  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  }

  // Protect kitchen - cannot be disabled
  if (staff.role === "KITCHEN") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Cannot change kitchen display status. It's required for system operation."
    );
  }

  const newStatus = 
    staff.status === "ACTIVE" 
      ? "SUSPENDED" 
      : "ACTIVE";

  const updated = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
    }
  });

  return updated;
};

// ========== ORDER NEST: Delete Staff by Manager ==========
const deleteStaffByManager = async (id: string) => {
  const staff = await prisma.user.findUnique({ where: { id } });

  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  }

  // Protect kitchen - cannot be deleted
  if (staff.role === "KITCHEN") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Cannot delete kitchen display. It's required for system operation."
    );
  }

  // Protect manager
  if (staff.role === "MANAGER") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Cannot delete manager account."
    );
  }

  const deleted = await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    }
  });

  return deleted;
};

export const UserService = {
  getMyProfile,
  updateUser,
  getSingleUserById,
  removeUserByAdmin,
  changeUserRole,
  getAllUsers,
  suspendOrActivateUser,
  createStaffByManager,   // ✅ Create Staff & Kitchen
  getAllStaff,            // ✅ Get all staff
  getSingleStaff,         // ✅ Get single staff
  updateStaffByManager,   // ✅ Update staff
  toggleStaffStatus,      // ✅ Toggle active/suspend
  deleteStaffByManager,   // ✅ Delete staff
};