import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Nur Bilddateien erlaubt."), false);
  }
};

const upload = multer({ storage, fileFilter });


router.route("/").post(upload.single("image"), (req, res) => {
  res.status(200).json({
    message: "Bild erfolgreich hochgeladen",
    imageUrl: `/uploads/${req.file.filename}`,
  });
});

export default router;
