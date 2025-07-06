import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"


// add products to user cart
const addToCart = async (req,res) => {
    try {
        console.log("Add to cart request body:", req.body);
        const { userId, itemId, size } = req.body

        if (!userId) {
            console.log("User ID missing in add to cart request");
            return res.json({ success: false, message: "User ID is required" });
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

        if (currentQuantity + 1 > availableStock) {
            return res.json({ success: false, message: "Cannot add more than available stock" });
        }

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            }
            else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Added To Cart" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId ,itemId, size, quantity } = req.body

        if (!userId) {
            return res.json({ success: false, message: "User ID is required" });
        }

        const userData = await userModel.findById(userId)
        
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};

        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body
        
        if (!userId) {
            return res.json({ success: false, message: "User ID is required" });
        }
        
        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        let cartData = userData.cartData || {};

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }