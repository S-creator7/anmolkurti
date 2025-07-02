import express from "express";
import {
    submitContactForm,
    getAllContacts,
    updateContactStatus,
    getContactById,
    deleteContact
} from "../controllers/contactController.js";
import adminAuth from "../middleware/adminAuth.js";

const contactRouter = express.Router();

// Public routes
contactRouter.post('/submit', submitContactForm);

// Admin routes
contactRouter.get('/list', adminAuth, getAllContacts);
contactRouter.get('/:id', adminAuth, getContactById);
contactRouter.put('/update/:id', adminAuth, updateContactStatus);
contactRouter.delete('/delete/:id', adminAuth, deleteContact);

export default contactRouter; 