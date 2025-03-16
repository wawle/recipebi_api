import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/async";
import ErrorResponse from "../utils/error-response";
import Recipe from "../models/recipe";

// @desc      Get all recipes
// @route     GET /api/v1/recipes
// @access    Private
export const getRecipes = asyncHandler(
  async (req: Request, res: any, next: NextFunction): Promise<void> => {
    if (req.params.userId) {
      const recipes = await Recipe.find({ user: req.params.userId });
      return res.status(200).json({
        success: true,
        total: recipes.length,
        data: recipes,
      });
    } else {
      res.status(200).json(res.advancedResults);
    }
  }
);

// @desc      Get single recipe
// @route     GET /api/v1/recipes/:id
// @access    Private
export const getRecipe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let recipe;
    if (req.params.userId) {
      recipe = await Recipe.findOne({
        _id: req.params.id,
        user: req.params.userId,
      });
    } else {
      recipe = await Recipe.findById(req.params.id);
    }

    if (!recipe) {
      return next(
        new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  }
);

// @desc      Create recipe
// @route     POST /api/v1/recipes
// @access    Private
export const createRecipe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.params.userId) {
      req.body.user = req.params.userId;
    }
    const recipe = await Recipe.create(req.body);

    res.status(201).json({
      success: true,
      data: recipe,
    });
  }
);

// @desc      Update recipe
// @route     PUT /api/v1/recipes/:id
// @access    Private
export const updateRecipe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.params.userId) {
      req.body.user = req.params.userId;
    }
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!recipe) {
      return next(
        new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  }
);

// @desc      Delete recipe
// @route     DELETE /api/v1/recipes/:id
// @access    Private
export const deleteRecipe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let recipe;
    if (req.params.userId) {
      recipe = await Recipe.findOneAndDelete({
        _id: req.params.id,
        user: req.params.userId,
      });
    } else {
      recipe = await Recipe.findByIdAndDelete(req.params.id);
    }

    if (!recipe) {
      return next(
        new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

// @desc      Upload recipe image
// @route     PUT /api/v1/recipes/:id/image
// @access    Private
export const uploadPhotoRecipe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      return next(new ErrorResponse("Please upload a file", 400));
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(
        new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
      );
    }

    const filePath = `uploads/${req.file.filename}`;

    recipe.image = filePath;

    await recipe.save();

    res.status(200).json({
      success: true,
      data: recipe,
    });
  }
);
