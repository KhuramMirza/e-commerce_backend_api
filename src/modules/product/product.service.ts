import { ProductModel } from "./product.model.js";
import { CreateProductInput } from "./product.schema.js";

export const createProduct = async (data: CreateProductInput) => {
  return await ProductModel.create(data);
};

export const getAllProducts = async () => {
  return await ProductModel.find({ isActive: true });
};
