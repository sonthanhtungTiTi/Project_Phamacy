import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtPurchase: {
    type: Number,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  orderItems: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "rejected", "completed", "cancelled"],
    default: "pending"
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  prescriptionImage: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid"
  },
  notes: String,
  rejectionReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  rejectedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);
const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export { Order, OrderItem };
