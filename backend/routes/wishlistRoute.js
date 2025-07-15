import express from "express";
import {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    clearWishlist
} from "../controllers/wishlistController.js";
import { auth } from "../middleware/auth.js";

const wishlistRouter = express.Router();

wishlistRouter.post('/add', auth, addToWishlist);
wishlistRouter.delete('/remove', auth, removeFromWishlist);
wishlistRouter.get('/', auth, getWishlist); // Changed to GET and simplified path
wishlistRouter.post('/clear', auth, clearWishlist);

export default wishlistRouter; 