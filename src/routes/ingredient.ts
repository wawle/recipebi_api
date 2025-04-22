import express, { RequestHandler } from "express";
import { IngredientController } from "../controllers/ingredient";

const router = express.Router();
const ingredientController = new IngredientController();

const searchIngredientsHandler: RequestHandler = async (req, res) => {
  await ingredientController.searchIngredients(req, res);
};

const createIngredientHandler: RequestHandler = async (req, res) => {
  await ingredientController.createIngredient(req, res);
};

router.get("/", searchIngredientsHandler);
router.post("/", createIngredientHandler);

export default router;
