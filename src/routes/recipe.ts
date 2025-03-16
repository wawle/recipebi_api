import express from "express";
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  uploadPhotoRecipe,
} from "../controllers/recipe";
import advancedResults from "../middleware/advanced-results";
import { protect } from "../middleware/auth";
import Recipe from "../models/recipe";
import libraryRouter from "./library";
import upload from "../utils/file-upload";

const router = express.Router({ mergeParams: true });

router.use(protect);
// Re-route into other resource routers
router.use("/:recipeId/cookbooks", libraryRouter);

// Get all cook books and create cook book
router
  .route("/")
  .get(advancedResults(Recipe as any, "cookbooks"), getRecipes)
  .post(createRecipe);

// Get single cook book, update cook book, delete cook book
router.route("/:id").get(getRecipe).put(updateRecipe).delete(deleteRecipe);

router.route("/:id/photo").put(upload.single("photo"), uploadPhotoRecipe);

export default router;
