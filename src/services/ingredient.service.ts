import Ingredient, { IIngredientModal } from "../models/ingredient";
import { Request } from "express";

export class IngredientService {
  async searchIngredients(
    searchTerm: string
  ): Promise<IIngredientModal[]> {
    try {
      const ingredients = await Ingredient.find({
        name: { $regex: searchTerm, $options: "i" },
      }).sort({ name: 1 });

      return ingredients;
    } catch (error) {
      throw error;
    }
  }

  async getAllIngredients(): Promise<IIngredientModal[]> {
    try {
      const ingredients = await Ingredient.find().sort({ name: 1 });
      return ingredients;
    } catch (error) {
      throw error;
    }
  }

  async createIngredient(
    data: Partial<IIngredientModal>
  ): Promise<IIngredientModal> {
    try {
      const ingredient = await Ingredient.create(data);
      return ingredient;
    } catch (error) {
      throw error;
    }
  }
}
