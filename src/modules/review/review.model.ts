import mongoose, { Schema, InferSchemaType } from "mongoose";
import { ProductModel } from "../product/product.model.js"; // We will need this later

const ReviewSchema = new Schema(
  {
    review: { type: String, required: [true, "Review can not be empty!"] },
    rating: { type: Number, min: 1, max: 5, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// This ensures that for a specific Product, a specific User ID can only appear once. Mongoose Composite Indexes
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// 1. Define the Static Method (Static methods are called on the Model itself not the instances or documents)
ReviewSchema.statics.calcAverageRatings = async function (productId) {
  // Aggregation Pipeline is used to perform calculations on multiple documents in a collection
  const stats = await this.aggregate([
    // Stage 1: Filter to find reviews for THIS product
    { $match: { product: productId } },

    // Stage 2: Group all the reviews for this product and Calculate stats
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 }, // Count the documents
        avgRating: { $avg: "$rating" }, // Calculate average of 'rating' field
      },
    },
  ]);

  // Stage 3: Update the Product
  if (stats.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // If no reviews left (we deleted the last one), reset to defaults
    await ProductModel.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// 2. Call the method AFTER a review is Saved
ReviewSchema.post("save", function () {
  // 'this' points to the current review being saved
  // (this.constructor as any) points to the ReviewModel
  (this.constructor as any).calcAverageRatings(this.product);
});

export type Review = InferSchemaType<typeof ReviewSchema>;
export const ReviewModel = mongoose.model("Review", ReviewSchema);
