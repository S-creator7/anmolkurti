import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"


// add products to user cart
const addToCart = async (req,res) => {
    try {
        console.log("Add to cart request body:", req.body);
        console.log("Authenticated user:", req.user);
        
        const { itemId, size } = req.body
        const userId = req.user.userId; // Get userId from JWT token via auth middleware

        if (!userId) {
            console.log("User ID missing from token");
            return res.json({ success: false, message: "Authentication required" });
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            console.log("User not found for ID:", userId);
            return res.status(404).json({ success: false, message: "User not found" })
        }

        // Fetch product to check stock
        const product = await productModel.findById(itemId)
        if (!product) {
            console.log("Product not found for ID:", itemId);
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        let cartData = userData.cartData || {};
        let currentQuantity = 0;
        if (cartData[itemId] && cartData[itemId][size]) {
            currentQuantity = cartData[itemId][size];
        }

        // Determine available stock for the size
        let availableStock = 0;
        if (product.hasSize) {
            if (product.stock && product.stock[size] !== undefined) {
                availableStock = product.stock[size];
            } else {
                availableStock = 0;
            }
        } else {
            if (typeof product.stock === 'number') {
                availableStock = product.stock;
            } else {
                availableStock = 0;
            }
        }

        // ✅ Enhanced stock validation with better error messages
        if (availableStock <= 0) {
            return res.json({ success: false, message: "📦 Out of stock" });
        }

        if (currentQuantity + 1 > availableStock) {
            return res.json({ success: false, message: `Only ${availableStock} items available in stock` });
        }

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Added to cart" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        const { itemId, size, quantity } = req.body
        const userId = req.user.userId; // Get userId from JWT token via auth middleware

        if (!userId) {
            return res.json({ success: false, message: "Authentication required" });
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        // Fetch product to check stock before updating
        const product = await productModel.findById(itemId)
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        let cartData = userData.cartData || {};

        if (quantity === 0) {
            // Remove item from cart
            if (cartData[itemId]) {
                if (size && cartData[itemId][size] !== undefined) {
                    delete cartData[itemId][size];
                    // If no sizes left for this item, remove the item entirely
                    if (Object.keys(cartData[itemId]).length === 0) {
                        delete cartData[itemId];
                    }
                } else if (!size) {
                    delete cartData[itemId];
                }
            }
        } else {
            // Validate stock before updating quantity
            let availableStock = 0;
            if (product.hasSize) {
                if (product.stock && product.stock[size] !== undefined) {
                    availableStock = product.stock[size];
                } else {
                    availableStock = 0;
                }
            } else {
                if (typeof product.stock === 'number') {
                    availableStock = product.stock;
                } else {
                    availableStock = 0;
                }
            }

            // ✅ Enhanced stock validation with better error messages
            if (availableStock <= 0) {
                return res.json({ success: false, message: "📦 Out of stock" });
            }

            if (quantity > availableStock) {
                return res.json({ success: false, message: `Only ${availableStock} items available in stock` });
            }

            // Update quantity
            if (cartData[itemId]) {
                if (size) {
                    cartData[itemId][size] = quantity;
                } else {
                    cartData[itemId] = { quantity };
                }
            } else {
                cartData[itemId] = {};
                if (size) {
                    cartData[itemId][size] = quantity;
                } else {
                    cartData[itemId] = { quantity };
                }
            }
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// get user cart data
const getUserCart = async (req,res) => {
    try {
        const userId = req.user.userId; // Get userId from JWT token via auth middleware

        if (!userId) {
            return res.json({ success: false, message: "Authentication required" });
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        let cartData = userData.cartData || {}
        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateCart, getUserCart }