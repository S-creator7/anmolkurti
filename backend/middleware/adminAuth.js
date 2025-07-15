import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        console.log("adminAuth middleware - token received:", token);
        
        if (!token) {
            console.log("adminAuth middleware - no token provided");
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log("adminAuth middleware - token decoded:", token_decode);
        
        // Check if the decoded token has admin privileges
        if (!token_decode.isAdmin) {
            console.log("adminAuth middleware - user is not admin");
            return res.json({ success: false, message: "Access denied. Admin privileges required." })
        }

        // Add user info to request object for use in controllers
        req.user = {
            userId: token_decode.userId,
            email: token_decode.email,
            isAdmin: token_decode.isAdmin
        };

        console.log("adminAuth middleware - authorization successful");
        next()
    } catch (error) {
        console.log("adminAuth middleware error:", error)
        res.json({ success: false, message: "Invalid or expired token" })
    }
}

export default adminAuth
