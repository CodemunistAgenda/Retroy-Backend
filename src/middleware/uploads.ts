import multer from "multer";
import { storage } from "../utils/cloudinary";

const upload = multer({ storage });

export default upload;
