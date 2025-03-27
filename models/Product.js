import { model, Schema } from "mongoose";

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    brand: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number }, 
    stock: { type: Number, required: true },
    sku: { type: String, unique: true }, 
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    unit: { type: String, enum: ["kg", "lt", "adet"], default: "adet" }, 
    images: [{ type: String }]
  },
  { timestamps: true }
);

const Product = model("Product", productSchema);
export default Product;
