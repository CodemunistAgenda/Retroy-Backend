import { v2 as cloudinary } from "cloudinary";
import Product from "../models/product.model";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function extractPubId(url: string): string {
  const parts = url.split("/");
  const last = parts[parts.length - 1];
  return "products/" + last?.split(".")[0];
}

export async function cleanCloudinaryImage(): Promise<any> {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "products/",
      max_results: 100,
      resource_type: "image",
    });

    const cloudImages = result.resources.map((res: any) => res.public_id);

    const dbImages = await Product.find().distinct("images");
    const dbPubId = dbImages.map(extractPubId);

    const unusedImages = cloudImages.filter((id: any) => !dbPubId.includes(id));

    const deleted = [];

    for (const id of unusedImages) {
      try {
        const res = await cloudinary.uploader.destroy(id);

        if (res.result === "ok") deleted.push(id);

        console.log(`Deleted image: ${id}`);
      } catch (error) {
        console.error(`Error deleting image ${id}:`, error);
      }
    }

    return {
      checked: cloudImages.length,
      deleted: deleted.length,
      notUsed: unusedImages.length,
      deletedImages: deleted,
    };
  } catch (error) {
    console.error("Error fetching resources from Cloudinary:", error);
    throw error;
  }
}
