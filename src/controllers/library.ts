import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/async";
import ErrorResponse from "../utils/error-response";
import Library from "../models/library";

// @desc      Get all libraries
// @route     GET /api/v1/libraries
// @access    Private
export const getLibraries = asyncHandler(
  async (req: Request, res: any, next: NextFunction): Promise<void> => {
    if (req.params.cookBookId) {
      const libraries = await Library.find({
        cookbook: req.params.cookBookId,
      })
        .select("recipe")
        .populate({
          path: "recipe",
          select: "-__v -user",
        });
      const data = libraries.map((library) => {
        return library.recipe;
      });
      return res.status(200).json({
        success: true,
        total: data.length,
        data: data,
      });
    } else if (req.params.recipeId) {
      const libraries = await Library.find({
        recipe: req.params.recipeId,
      })
        .select("cookbook")
        .populate({
          path: "cookbook",
          select: "-__v -user",
        });
      const data = libraries.map((library) => {
        return library.cookbook;
      });
      return res.status(200).json({
        success: true,
        total: data.length,
        data: data,
      });
    } else {
      res.status(200).json(res.advancedResults);
    }
  }
);

// @desc      Get single library
// @route     GET /api/v1/libraries/:id
// @access    Private
export const getLibrary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let library;
    if (req.params.cookBookId) {
      library = await Library.findOne({
        _id: req.params.id,
        cookBook: req.params.cookBookId,
      });
    } else if (req.params.recipeId) {
      library = await Library.findOne({
        _id: req.params.id,
        recipe: req.params.recipeId,
      });
    } else {
      library = await Library.findById(req.params.id);
    }

    if (!library) {
      return next(
        new ErrorResponse(`Library not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: library,
    });
  }
);

// @desc      Create library
// @route     POST /api/v1/libraries
// @access    Private
export const createLibrary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.params.cookBookId) {
      req.body.cookbook = req.params.cookBookId;
    } else if (req.params.recipeId) {
      req.body.recipe = req.params.recipeId;
    }
    const library = await Library.create(req.body);

    res.status(201).json({
      success: true,
      data: library,
    });
  }
);

// @desc      Update library
// @route     PUT /api/v1/libraries/:id
// @access    Private
export const updateLibrary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let library;
    if (req.params.cookBookId) {
      library = await Library.findOneAndUpdate(
        { _id: req.params.id, cookBook: req.params.cookBookId },
        req.body,
        { new: true, runValidators: true }
      );
    } else if (req.params.recipeId) {
      library = await Library.findOneAndUpdate(
        { _id: req.params.id, recipe: req.params.recipeId },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      library = await Library.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    if (!library) {
      return next(
        new ErrorResponse(`Library not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: library,
    });
  }
);

// @desc      Delete library
// @route     DELETE /api/v1/libraries/:id
// @access    Private
export const deleteLibrary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let library;
    if (req.params.cookBookId) {
      library = await Library.findOneAndDelete({
        _id: req.params.id,
        cookbook: req.params.cookBookId,
      });
    } else if (req.params.recipeId) {
      library = await Library.findOneAndDelete({
        _id: req.params.id,
        recipe: req.params.recipeId,
      });
    } else {
      library = await Library.findByIdAndDelete(req.params.id);
    }
    if (!library) {
      return next(
        new ErrorResponse(`Library not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);
