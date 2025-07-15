import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    // For registered users
    userId: { type: String, required: false }, // ✅ Now optional for guest checkout
    
    // For guest users
    isGuest: { type: Boolean, default: false },
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
    
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default:'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true , default: false },
    date: {type: Number, required:true},
    coupon: {
        code: { type: String, default: null },
        discountAmount: { type: Number, default: 0 },
        originalAmount: { type: Number, default: 0 }
    },
    orderType: { type: String, enum: ['regular', 'direct_buy', 'guest'], default: 'regular' }
})

const orderModel = mongoose.models.order || mongoose.model('order',orderSchema)
export default orderModel;