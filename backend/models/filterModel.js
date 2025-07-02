import mongoose from "mongoose";

const filterSchema = new mongoose.Schema({
  category: { type: String, required: true },
  filterName: { type: String, required: true },
  filterValues: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now }
});

const filterModel = mongoose.models.Filter || mongoose.model("Filter", filterSchema);

export default filterModel;
