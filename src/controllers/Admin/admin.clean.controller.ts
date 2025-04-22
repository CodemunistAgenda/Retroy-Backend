import { cleanCloudinaryImage } from "../../utils/cloudinary.cleaner";
import { type Request, type Response } from "express";
import { errorResponse, successResponse } from "../../utils/helper.function";

export const cleanUnUsedImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await cleanCloudinaryImage();
    if (result) {
      return successResponse(res, 200, "Unused images cleaned successfully", result);
    }
    return errorResponse(res, 400, "No unused images found");
  } catch (err) {
    return errorResponse(res, 500, "Error while cleaning unused images", err instanceof Error ? err.message : err);
  }
};
