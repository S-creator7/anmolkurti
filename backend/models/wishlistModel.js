import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    products: [{
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'product', 
            required: true 
        },
        addedAt: { 
            type: Date, 
            default: Date.now 
        }
    }]
}, { 
    timestamps: true 
});

// Ensure one wishlist per user
wishlistSchema.index({ userId: 1 }, { unique: true });

const wishlistModel = mongoose.models.wishlist || mongoose.model("wishlist", wishlistSchema);

export default wishlistModel;