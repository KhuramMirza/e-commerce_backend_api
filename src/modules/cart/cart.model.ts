import mongoose, { InferSchemaType, Schema, Document } from "mongoose";

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type Cart = InferSchemaType<typeof CartSchema>;

export const CartModel = mongoose.model<Cart>("Cart", CartSchema);
