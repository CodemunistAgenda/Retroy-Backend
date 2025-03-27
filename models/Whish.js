import { model, Schema } from "mongoose";

const whishSchema = new Schema({
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      },
      { timestamps: true }
    );

const Whish = model("Whish", whishSchema);
export default Whish;

