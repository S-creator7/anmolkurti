import express from "express";
import { register, login, getProfile, updateProfile, changePassword, requestPasswordReset, resetPassword, listUsers, getSingleUser, deleteUser, adminLogin, requestAdminPasswordReset } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/admin", adminLogin);

// Profile management routes (protected)
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.post("/change-password", auth, changePassword);

// Password reset routes
router.post("/request-reset", requestPasswordReset);
router.post("/admin-request-reset", requestAdminPasswordReset);
router.post("/reset-password", resetPassword);

// Admin routes
router.get("/list", adminAuth, listUsers);
router.get("/:id", adminAuth, getSingleUser);
router.delete("/:id", adminAuth, deleteUser);

export default router;