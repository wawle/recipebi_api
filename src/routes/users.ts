import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadPhotoUser,
} from "../controllers/users";
import advancedResults from "../middleware/advanced-results";
import User from "../models/user";
import { protect, authorize } from "../middleware/auth";
import { Role } from "../utils/enums";
import cookBookRouter from "./cook-book";
import recipeRouter from "./recipe";
import upload from "../utils/file-upload";

const router = express.Router({ mergeParams: true });

router.use(protect);

// Re-route into other resource routers
router.use("/:userId/cookbooks", cookBookRouter);
router.use("/:userId/recipes", recipeRouter);

// Get all users and create user
router
  .route("/")
  .get(authorize(Role.Admin), advancedResults(User as any), getUsers)
  .post(authorize(Role.Admin), createUser);

// Get single user, update user, delete user
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.route("/:id/photo").put(upload.single("photo"), uploadPhotoUser);

export default router;
