import express from "express";
import {
  getLibraries,
  getLibrary,
  createLibrary,
  updateLibrary,
  deleteLibrary,
} from "../controllers/library";
import advancedResults from "../middleware/advanced-results";
import { protect } from "../middleware/auth";
import Library from "../models/library";

const router = express.Router({ mergeParams: true });

router.use(protect);

// Get all cook books and create cook book
router
  .route("/")
  .get(advancedResults(Library as any, ["recipe", "cookbook"]), getLibraries)
  .post(createLibrary);

// Get single cook book, update cook book, delete cook book
router.route("/:id").get(getLibrary).put(updateLibrary).delete(deleteLibrary);

export default router;
