import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    gender: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    subCategory: { type: String, required: false, index: true, default: '' }, // Made optional - not integrated with filter system
    occasion: { type: [String], default: [], index: true },
    material: { type: [String], default: [], index: true },
    color: { type: [String], default: [], index: true },
    type: { type: [String], default: [], index: true },
    filterTags: { type: [String], default: [], index: true },
    sizes: { type: Array, required: true },
    hasSize: { type: Boolean, required: true, default: true },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    // stock can be either a Map (for sizes) or a Number (for no sizes)
    stock: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {}
    },
    //tracking subscribers for out of stock alerts
    stockAlerts: [String],
    filters: {
        type: Object,
        default: {}
    }

})

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel