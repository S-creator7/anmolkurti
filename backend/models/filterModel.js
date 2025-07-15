import mongoose from "mongoose";

const filterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Filter name like "Color", "Size", "Occasion"
  type: { 
    type: String, 
    required: true, 
    enum: ['global', 'category-specific'], // Global filters apply to all products, category-specific only to certain categories
    default: 'global'
  },
  displayName: { type: String, required: true }, // Display name for frontend
  description: { type: String }, // Optional description
  filterType: { 
    type: String, 
    required: true, 
    enum: ['single-select', 'multi-select', 'range'], // How the filter should behave
    default: 'multi-select'
  },
  values: [{ 
    value: { type: String, required: true },
    displayName: { type: String, required: true },
    colorCode: { type: String }, // For color filters
    isActive: { type: Boolean, default: true }
  }],
  applicableCategories: [{ type: String }], // Categories this filter applies to (for category-specific filters)
  sortOrder: { type: Number, default: 0 }, // Order of display
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure filter names are unique
filterSchema.index({ name: 1 }, { unique: true });

const filterModel = mongoose.models.Filter || mongoose.model("Filter", filterSchema);

export default filterModel;
