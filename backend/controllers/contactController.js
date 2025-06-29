import customerContactModel from "../models/customerContactModel.js";

// Submit contact form
const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const contact = new customerContactModel({
            name,
            email,
            phone,
            subject,
            message,
            source: 'website'
        });

        await contact.save();

        res.json({ 
            success: true, 
            message: "Your message has been sent successfully. We'll get back to you soon!" 
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all contacts (admin)
const getAllContacts = async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 20 } = req.query;
        
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const contacts = await customerContactModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await customerContactModel.countDocuments(filter);

        res.json({ 
            success: true, 
            contacts,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update contact status
const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo, note } = req.body;

        const updateData = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignedTo = assignedTo;

        const contact = await customerContactModel.findById(id);
        if (!contact) {
            return res.json({ success: false, message: "Contact not found" });
        }

        if (note) {
            contact.notes.push({
                note,
                addedBy: assignedTo || 'Admin',
                addedAt: new Date()
            });
        }

        Object.assign(contact, updateData);
        await contact.save();

        res.json({ success: true, message: "Contact updated successfully", contact });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get contact by ID
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await customerContactModel.findById(id);
        if (!contact) {
            return res.json({ success: false, message: "Contact not found" });
        }

        res.json({ success: true, contact });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete contact
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await customerContactModel.findByIdAndDelete(id);
        if (!contact) {
            return res.json({ success: false, message: "Contact not found" });
        }

        res.json({ success: true, message: "Contact deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    submitContactForm, 
    getAllContacts, 
    updateContactStatus, 
    getContactById, 
    deleteContact 
}; 