import mongoose, { InferSchemaType, Schema } from "mongoose";

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  Image: { type: String },
});

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "cancelled", "delivered"],
      default: "pending",
    },
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ["cash", "card"], default: "cash" },
  },
  { timestamps: true },
);

export type Order = InferSchemaType<typeof OrderSchema>;
export const OrderModel = mongoose.model<Order>("Order", OrderSchema);
