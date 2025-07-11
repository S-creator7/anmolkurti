import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {
        const { token } = req.headers
        console.log("adminAuth middleware - token received:", token);
        if (!token) {
            console.log("adminAuth middleware - no token provided");
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        console.log("adminAuth middleware - token decoded:", token_decode);
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            console.log("adminAuth middleware - token mismatch");
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        console.log("adminAuth middleware - authorization successful");
        next()
    } catch (error) {
        console.log("adminAuth middleware error:", error)
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth
