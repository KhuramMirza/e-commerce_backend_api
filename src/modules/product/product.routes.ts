import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { CreateProductSchema } from "./product.schema.js";
import { protect, adminOnly } from "../../common/middleware/auth.middleware.js";
import { upload } from "../../config/cloudinary.js";
import { handleImageUpload } from "../../common/middleware/upload.middleware.js";
import * as ProductController from "./product.controller.js";

const router = Router();

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  handleImageUpload,
  validate(CreateProductSchema),
  ProductController.createProductHandler,
);

router.get("/", ProductController.getProductsHandler);

export const productRoutes = router;
