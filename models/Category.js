import { model, Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String}
  },
  { timestamps: true }
);

const Category = model("Category", categorySchema);
export default Category;
