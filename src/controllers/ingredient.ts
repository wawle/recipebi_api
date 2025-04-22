import { Request, Response } from "express";
import { IngredientService } from "../services/ingredient.service";
import { IIngredientModal } from "../models/ingredient";

const ingredientService = new IngredientService();

export class IngredientController {
  async searchIngredients(req: Request, res: Response) {
    try {
      const { search } = req.query;

      if (search) {
        const ingredients = await ingredientService.searchIngredients(
          search as string
        );
        return res.status(200).json({
          success: true,
          data: ingredients,
        });
      }

      const ingredients = await ingredientService.getAllIngredients();
      return res.status(200).json({
        success: true,
        data: ingredients,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }

  async createIngredient(req: Request, res: Response) {
    try {
      const ingredient = await ingredientService.createIngredient(
        req.body
      );
      return res.status(201).json({
        success: true,
        data: ingredient,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
}
