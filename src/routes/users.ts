import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users";
import advancedResults from "../middleware/advanced-results";
import User from "../models/user";
import { protect, authorize } from "../middleware/auth";
import { Role } from "../utils/enums";
import cookBookRouter from "./cook-book";
import recipeRouter from "./recipe";
const router = express.Router({ mergeParams: true });

router.use(protect);

// Re-route into other resource routers
router.use("/:userId/cookbooks", cookBookRouter);
router.use("/:userId/recipes", recipeRouter);

router.use(authorize(Role.Admin) as express.RequestHandler);

// Get all users and create user
router
  .route("/")
  .get(
    advancedResults(User as any),

    getUsers
  )
  .post(createUser);

// Get single user, update user, delete user
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
