import path from "path";
import multer from "multer";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

// Storage konfigürasyonu
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Dosya ismini benzersiz hale getiriyoruz
    const uniqueSuffix = `${uuidv4()}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Dosya tipini kontrol etmek için filtre
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Sadece jpeg, jpg ve png formatında dosyaları kabul ediyoruz
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Sadece jpeg, jpg ve png formatındaki dosyalar kabul edilmektedir."
      ) as any,
      false
    );
  }
};

// Multer konfigürasyonu
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maksimum dosya boyutu
  },
  fileFilter,
});

export default upload;
