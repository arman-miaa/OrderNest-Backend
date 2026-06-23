import express from "express";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpars/fileUploader";
import { UserController } from "./user.controller";
import { checkBlockedStatus } from "../../middlewares/checkBlock";
import { UserRole } from "@prisma/client";

const router = express.Router();

// ========== PROFILE ROUTES (All authenticated users) ==========
router.get(
  "/profile", 
  auth(UserRole.MANAGER, UserRole.STAFF, UserRole.KITCHEN), 
  checkBlockedStatus, 
  UserController.getMyProfile
);

router.put(
  "/update-profile",
  auth(UserRole.MANAGER, UserRole.STAFF, UserRole.KITCHEN),
  fileUploader.upload.fields([{ name: "image", maxCount: 1 }]),
  UserController.updateUser
);

// ========== MANAGER ROUTES ==========
// Get all staff (STAFF + KITCHEN)
router.get(
  "/staff", 
  auth(UserRole.MANAGER), 
  UserController.getAllStaff
);

// Get single staff by ID
router.get(
  "/staff/:id", 
  auth(UserRole.MANAGER), 
  UserController.getSingleStaffById
);

// Create new staff/kitchen
router.post(
  "/staff/create", 
  auth(UserRole.MANAGER), 
  UserController.createStaff
);

// Update staff details
router.put(
  "/staff/:id", 
  auth(UserRole.MANAGER), 
  UserController.updateStaff
);

// Toggle staff status (Active/Suspended)
router.patch(
  "/staff/:id/toggle-status", 
  auth(UserRole.MANAGER), 
  UserController.toggleStaffStatus
);

// Delete staff (only WAITER, not KITCHEN)
router.delete(
  "/staff/:id", 
  auth(UserRole.MANAGER), 
  UserController.deleteStaff
);

export const userRoutes = router;