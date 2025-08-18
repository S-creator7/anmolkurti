import mongoose from 'mongoose';

// Sub-schema for each item in the order
const orderItemSchema = new mongoose.Schema({
  _id: { type: String, required: true },       // Product ID
  name: { type: String, required: false },     // Optional: product name snapshot
  quantity: { type: Number, required: true },
  size: { type: String, required: false },     // optional, if your product has sizes
  image: { type: String, required: false },    // product image URL (main image)
  price: { type: Number, required: false },    // price per item (snapshot)
});

// Main order schema
const orderSchema = new mongoose.Schema({
  // For registered users
  userId: { type: String, required: false }, // optional for guest checkout

  // Guest user info
  isGuest: { type: Boolean, default: false },
  guestInfo: {
    email: {
      type: String,
      required: function () { return this.isGuest; },
    },
    phone: {
      type: String,
      required: function () { return this.isGuest; },
    },
    name: {
      type: String,
      required: function () { return this.isGuest; },
    },
  },

  items: { type: [orderItemSchema], required: true },

  amount: { type: Number, required: true },          // total amount after discount + delivery
  address: { type: Object, required: true },         // delivery address object
  status: { type: String, required: true, default: 'Order Placed' },

  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },

  date: { type: Number, required: true },             // timestamp

  coupon: {
    code: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    originalAmount: { type: Number, default: 0 },
  },

  orderType: {
    type: String,
    enum: ['regular', 'direct_buy', 'guest'],
    default: 'regular',
  },

  utrNumber: { type: String, default: null },
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
