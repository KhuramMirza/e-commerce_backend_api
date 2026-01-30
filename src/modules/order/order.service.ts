import { OrderModel } from "./order.model.js";
import { CartModel } from "../cart/cart.model.js";
import { ProductModel } from "../product/product.model.js";
import { AppError } from "../../common/utils/AppError.js";
import { CreateOrderInput } from "./order.schema.js";

export const createOrder = async (
  userId: string,
  orderData: CreateOrderInput,
) => {
  // Fetch the user's cart
  const cart = await CartModel.findOne({ user: userId }).populate(
    "items.product",
  );

  // Throw an error if cart is empty
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  // Prepare order items
  const orderItems = cart.items.map((item: any) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    Image: item.product.Image,
  }));

  // Create Order
  const order = await OrderModel.create({
    user: userId,
    items: orderItems,
    totalPrice: cart.totalPrice,
    address: orderData.address,
    paymentMethod: orderData.paymentMethod || "cash",
    status: "pending",
  });

  // Fetch the full user details (email, name)
  await order.populate("user");

  // Clear the user's cart
  cart.items = [] as any;
  cart.totalPrice = 0;
  await cart.save();

  // Decrease product stock
  for (const item of orderItems) {
    await ProductModel.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  return order;
};

export const getMyOrders = async (userId: string) => {
  return await OrderModel.find({ user: userId }).sort({ createdAt: -1 });
};

export const getAllOrders = async () => {
  return await OrderModel.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await OrderModel.findByIdAndUpdate(
    orderId,
    { status },
    { new: true },
  );

  if (!order) throw new AppError("Order not found", 404);
  return order;
};
