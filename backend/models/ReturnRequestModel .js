import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Array of item IDs, optional
  reason: { type: String, default: 'No reason provided' },
  status: { type: String, default: 'Pending' },
  requestedAt: { type: Date, default: Date.now }
});

const ReturnRequestModel = mongoose.model('ReturnRequest', returnRequestSchema);
export default ReturnRequestModel;
