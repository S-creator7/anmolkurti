import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    cartData: { type: Object, default: {} },
    address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        zipCode: { type: String, default: "" },
        country: { type: String, default: "" }
    },
    preferences: {
        newsletter: { type: Boolean, default: false },
        smsUpdates: { type: Boolean, default: false },
        stockAlerts: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true }
    },
    stats: {
        totalOrders: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        wishlistItems: { type: Number, default: 0 }
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
}, { 
    minimize: false,
    timestamps: true // This will add createdAt and updatedAt fields
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel