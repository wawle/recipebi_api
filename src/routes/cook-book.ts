import express from "express";
import {
  getCookBooks,
  getCookBook,
  createCookBook,
  updateCookBook,
  deleteCookBook,
  uploadPhotoCookBook,
} from "../controllers/cook-book";
import advancedResults from "../middleware/advanced-results";
import { protect } from "../middleware/auth";
import CookBook from "../models/cook-book";
import libraryRouter from "./library";
import upload from "../utils/file-upload";

const router = express.Router({ mergeParams: true });

router.use(protect);
// Re-route into other resource routers
router.use("/:cookBookId/recipes", libraryRouter);

// Get all cook books and create cook book
router
  .route("/")
  .get(advancedResults(CookBook as any, "recipes"), getCookBooks)
  .post(createCookBook);

// Get single cook book, update cook book, delete cook book
router
  .route("/:id")
  .get(getCookBook)
  .put(updateCookBook)
  .delete(deleteCookBook);

router.route("/:id/photo").put(upload.single("photo"), uploadPhotoCookBook);

export default router;
