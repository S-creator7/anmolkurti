import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const auth = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.json({ success: false, message: "Authentication required" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Verify user still exists
            const user = await userModel.findById(decoded.userId);
            if (!user) {
                return res.json({ success: false, message: "User not found" });
            }

            next();
        } catch (error) {
            return res.json({ success: false, message: "Invalid token" });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.json({ success: false, message: "Authentication failed" });
    }
};

export const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.json({ success: false, message: "Admin authentication required" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verify user exists and is admin
            const user = await userModel.findById(decoded.userId);
            if (!user) {
                return res.json({ success: false, message: "User not found" });
            }

            if (!user.isAdmin) {
                return res.json({ success: false, message: "Admin access required" });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.json({ success: false, message: "Invalid admin token" });
        }
    } catch (error) {
        console.error("Admin auth middleware error:", error);
        res.json({ success: false, message: "Admin authentication failed" });
    }
};