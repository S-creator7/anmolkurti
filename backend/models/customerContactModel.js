import mongoose from "mongoose";

const customerContactSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    subject: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'resolved'], 
        default: 'pending' 
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
    },
    source: { 
        type: String, 
        enum: ['website', 'email', 'phone', 'social'], 
        default: 'website' 
    },
    assignedTo: { 
        type: String, 
        default: null 
    },
    notes: [{ 
        note: String, 
        addedBy: String, 
        addedAt: { type: Date, default: Date.now } 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const customerContactModel = mongoose.models.customerContact || mongoose.model("customerContact", customerContactSchema);

export default customerContactModel;