import { CartModel } from "./cart.model.js";
import { ProductModel } from "../product/product.model.js";
import { AppError } from "../../common/utils/AppError.js";
import { AddToCartInput } from "./cart.schema.js";

export const addToCart = async (userId: string, data: AddToCartInput) => {
  const { productId, quantity } = data;

  // 1. Get the Product (We need the real price)
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // 2. Find the User's Cart
  let cart = await CartModel.findOne({ user: userId });

  // 3. If no cart exists, create one
  if (!cart) {
    cart = await CartModel.create({
      user: userId,
      items: [],
      totalPrice: 0,
    });
  }

  // 4. Check if item exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (existingItemIndex > -1) {
    // A. Item exists -> Update quantity
    cart.items[existingItemIndex].quantity += quantity as number;
  } else {
    // B. New Item -> Push to array
    cart.items.push({
      product: product._id, // Use the object ID
      quantity: quantity,
    });
  }

  // 5. Recalculate Total Price (Safety First!)
  // We cannot trust the client. We must recalculate the whole cart.
  // Note: For a real production app, we would populate all items to get current prices.
  // For now, let's keep it simple and increment.

  /* Wait! To do this correctly, we should fetch current prices for ALL items in cart
     to ensure the total is accurate. Let's do a simple calculation loop.
  */

  // Recalculate logic:
  let total = 0;
  // We need to fetch details for all items to get their price
  // This looks expensive, but ensures data integrity.
  const cartWithProducts = await cart.populate("items.product");

  // @ts-ignore - 'items.product' is now a full Product object, not just ID
  cart.items.forEach((item) => {
    // @ts-ignore
    total += item.product.price * item.quantity;
  });

  cart.totalPrice = total;
  await cart.save();

  return cart;
};

export const getCart = async (userId: string) => {
  // Find cart and populate product details
  const cart = await CartModel.findOne({ user: userId }).populate(
    "items.product",
  );

  // If they don't have a cart yet, return null or an empty structure
  // Returning null is fine; the controller can decide how to handle it.
  return cart;
};

export const removeFromCart = async (userId: string, productId: string) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) return null;

  // 1. Remove the item using standard array filter
  // We compare Strings to Strings just to be safe
  const newItems = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  cart.items = newItems as any; // Cast ensures TS doesn't fight the mongoose array type

  // 2. Recalculate Total
  // We must populate again to get the prices of the REMAINING items
  await cart.populate("items.product");

  let total = 0;
  cart.items.forEach((item) => {
    // @ts-ignore
    total += item.product.price * item.quantity;
  });

  cart.totalPrice = total;
  await cart.save();

  return cart;
};

export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  // 1. Validate Quantity
  // If they send 0 (or negative), just remove the item entirely
  if (quantity < 1) {
    // Reuse your existing remove function! DRY (Don't Repeat Yourself)
    return removeFromCart(userId, productId);
  }

  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found", 404);

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    throw new AppError("Item not found in cart", 404);
  }

  // 2. Update
  cart.items[itemIndex].quantity = quantity;

  // 3. Recalculate
  await cart.populate("items.product");
  let total = 0;
  cart.items.forEach((item) => {
    // @ts-ignore
    total += item.product.price * item.quantity;
  });

  cart.totalPrice = total;
  await cart.save();

  return cart;
};
