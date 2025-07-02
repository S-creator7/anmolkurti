import express from 'express';
import { loginUser,registerUser,adminLogin, getAllUsers } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)

// New route to get all users
userRouter.get('/list', getAllUsers);

export default userRouter;