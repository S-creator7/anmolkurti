import mongoose from "mongoose";

const tempOrderSchema = new mongoose.Schema({
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  // For registered users
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // ✅ Now optional for guest checkout
  },
  // For guest users
  isGuest: {
    type: Boolean,
    default: false,
  },
  guestInfo: {
    email: {
      type: String,
      required: function() { return this.isGuest; }
    },
    phone: {
      type: String,
      required: function() { return this.isGuest; }
    },
    name: {
      type: String,
      required: function() { return this.isGuest; }
    }
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
      size: String
    }
  ],
  address: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // ⏳ auto-delete after 1 hour
  }
});

const TempOrder = mongoose.model('TempOrder', tempOrderSchema);
export default TempOrder;
