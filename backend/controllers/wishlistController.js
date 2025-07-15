import wishlistModel from "../models/wishlistModel.js";

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.userId; // Get userId from JWT token via auth middleware

        if (!userId || !productId) {
            return res.json({ success: false, message: "User ID and Product ID are required" });
        }

        let wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            wishlist = new wishlistModel({
                userId,
                products: [{ productId }]
            });
        } else {
            // Check if product already exists in wishlist
            const existingProduct = wishlist.products.find(item => 
                item.productId.toString() === productId
            );

            if (existingProduct) {
                return res.json({ success: false, message: "Product already in wishlist" });
            }

            wishlist.products.push({ productId });
        }

        await wishlist.save();
        res.json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.userId; // Get userId from JWT token via auth middleware

        const wishlist = await wishlistModel.findOne({ userId });
        if (!wishlist) {
            return res.json({ success: false, message: "Wishlist not found" });
        }

        wishlist.products = wishlist.products.filter(item => 
            item.productId.toString() !== productId
        );

        await wishlist.save();
        res.json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId; // Get userId from JWT token via auth middleware

        const wishlist = await wishlistModel.findOne({ userId })
            .populate('products.productId', 'name price image category subCategory stock hasSize sizes');

        if (!wishlist) {
            return res.json({ 
                success: true, 
                wishlist: { userId, products: [] }
            });
        }

        // Filter out any null/undefined populated products
        const validProducts = wishlist.products.filter(item => item.productId);

        res.json({ 
            success: true, 
            wishlist: {
                ...wishlist.toObject(),
                products: validProducts
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
    try {
        const userId = req.user.userId; // Get userId from JWT token via auth middleware

        await wishlistModel.findOneAndUpdate(
            { userId },
            { products: [] },
            { upsert: true }
        );

        res.json({ success: true, message: "Wishlist cleared successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addToWishlist, removeFromWishlist, getWishlist, clearWishlist }; 