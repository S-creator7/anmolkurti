import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail } from "../services/emailService.js";

// Register new user
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, address, preferences } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "Email already registered" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.json({ success: false, message: "Password must be at least 6 characters long" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phone: phone || "",
            address: {
                street: address?.street || "",
                city: address?.city || "",
                state: address?.state || "",
                zipCode: address?.zipCode || "",
                country: address?.country || ""
            },
            preferences: {
                newsletter: preferences?.newsletter || false,
                smsUpdates: preferences?.smsUpdates || false,
                stockAlerts: preferences?.stockAlerts || true
            }
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ success: true, message: "Registration successful", token });
    } catch (error) {
        console.error("Registration error:", error);
        res.json({ success: false, message: "Registration failed" });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ success: true, message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.json({ success: false, message: "Login failed" });
    }
};

// Admin login - separate endpoint for admin panel
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Admin not found" });
        }

        // Check if user is admin
        if (!user.isAdmin) {
            return res.json({ success: false, message: "Access denied. Admin privileges required." });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ success: true, message: "Admin login successful", token });
    } catch (error) {
        console.error("Admin login error:", error);
        res.json({ success: false, message: "Admin login failed" });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Get user stats
        const stats = {
            totalOrders: user.stats.totalOrders,
            totalSpent: user.stats.totalSpent,
            wishlistItems: user.stats.wishlistItems
        };

        // Format the response
        const userData = {
            ...user.toObject(),
            joinDate: user.createdAt,
            stats
        };

        delete userData.cartData; // Remove unnecessary cart data
        delete userData.resetPasswordToken;
        delete userData.resetPasswordExpires;

        res.json({ 
            success: true, 
            user: userData
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.json({ success: false, message: "Failed to fetch profile" });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, preferences, avatar } = req.body;
        
        const updates = {
            name,
            phone,
            address,
            preferences,
            avatar
        };

        // Remove undefined fields
        Object.keys(updates).forEach(key => 
            updates[key] === undefined && delete updates[key]
        );

        const user = await userModel.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true }
        ).select("-password -cartData -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ 
            success: true, 
            message: "Profile updated successfully", 
            user: {
                ...user.toObject(),
                joinDate: user.createdAt,
                stats: user.stats
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.json({ success: false, message: "Failed to update profile" });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find user
        const user = await userModel.findById(req.user.userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.json({ success: false, message: "New password must be at least 6 characters long" });
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.json({ success: false, message: "Failed to change password" });
    }
};

// Request password reset for customers
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({ 
                success: true, 
                message: "If an account with this email exists, you will receive password reset instructions." 
            });
        }

        // Don't allow password reset for admin accounts through customer endpoint
        if (user.isAdmin) {
            return res.json({ 
                success: false, 
                message: "Admin accounts must use the admin password reset process." 
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email, type: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email
        const emailResult = await sendPasswordResetEmail(email, resetToken, false);
        
        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
            return res.json({ 
                success: false, 
                message: "Failed to send password reset email. Please try again later." 
            });
        }

        res.json({ 
            success: true, 
            message: "Password reset instructions have been sent to your email address." 
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        res.json({ success: false, message: "Failed to process password reset request" });
    }
};

// Request password reset for admin
export const requestAdminPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        const user = await userModel.findOne({ email });
        if (!user || !user.isAdmin) {
            // Don't reveal if admin email exists for security
            return res.json({ 
                success: true, 
                message: "If an admin account with this email exists, you will receive password reset instructions." 
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: true, type: 'admin_password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send admin reset email
        const emailResult = await sendPasswordResetEmail(email, resetToken, true);
        
        if (!emailResult.success) {
            console.error('Failed to send admin password reset email:', emailResult.error);
            return res.json({ 
                success: false, 
                message: "Failed to send password reset email. Please try again later." 
            });
        }

        res.json({ 
            success: true, 
            message: "Admin password reset instructions have been sent to your email address." 
        });
    } catch (error) {
        console.error("Admin password reset request error:", error);
        res.json({ success: false, message: "Failed to process admin password reset request" });
    }
};

// Reset password with token
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.json({ success: false, message: "Token and new password are required" });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.json({ success: false, message: "Password must be at least 6 characters long" });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.json({ success: false, message: "Invalid or expired reset token" });
        }

        // Find user with valid reset token
        const user = await userModel.findOne({
            _id: decoded.userId,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.json({ success: false, message: "Invalid or expired reset token" });
        }

        // Update password and clear reset token
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        // Send success email
        await sendPasswordResetSuccessEmail(user.email, user.isAdmin);

        res.json({ success: true, message: "Password reset successful. You can now log in with your new password." });
    } catch (error) {
        console.error("Password reset error:", error);
        res.json({ success: false, message: "Failed to reset password" });
    }
};

// Get single user (admin only)
export const getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await userModel.findById(id)
            .select("-password -cartData -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ 
            success: true, 
            user: {
                ...user.toObject(),
                joinDate: user.createdAt
            }
        });

    } catch (error) {
        console.error("Get single user error:", error);
        res.json({ success: false, message: "Failed to fetch user details" });
    }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await userModel.findById(id);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Prevent deleting the super admin account specifically
        if (user.email === "admin@anmolkurtis.com") {
            return res.json({ success: false, message: "Cannot delete the super admin account" });
        }

        // Prevent deleting admin users
        if (user.isAdmin) {
            return res.json({ success: false, message: "Cannot delete admin users" });
        }

        await userModel.findByIdAndDelete(id);
        res.json({ success: true, message: "User deleted successfully" });

    } catch (error) {
        console.error("Delete user error:", error);
        res.json({ success: false, message: "Failed to delete user" });
    }
};

// Update listUsers to include search and sort
export const listUsers = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await userModel.countDocuments(query);

        const users = await userModel.find(query)
            .select("-password -cartData -resetPasswordToken -resetPasswordExpires")
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total
        });

    } catch (error) {
        console.error("List users error:", error);
        res.json({ success: false, message: "Failed to fetch users" });
    }
};

