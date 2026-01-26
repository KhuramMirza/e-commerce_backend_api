import { Request, Response } from "express";
import * as ProductService from "./product.service.js";
import { CreateProductInput } from "./product.schema.js";

export const createProductHandler = async (
  req: Request<{}, {}, CreateProductInput>,
  res: Response,
) => {
  const product = await ProductService.createProduct(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
};

export const getProductsHandler = async (req: Request, res: Response) => {
  const products = await ProductService.getAllProducts();

  res.status(200).json({
    success: true,
    data: products,
  });
};
