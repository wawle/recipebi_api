import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/async";
import ErrorResponse from "../utils/error-response";
import CookBook from "../models/cook-book";

// @desc      Get all cook books
// @route     GET /api/v1/cookbooks
// @access    Private
export const getCookBooks = asyncHandler(
  async (req: Request, res: any, next: NextFunction): Promise<void> => {
    if (req.params.userId) {
      const cookBooks = await CookBook.find({ user: req.params.userId });
      return res.status(200).json({
        success: true,
        total: cookBooks.length,
        data: cookBooks,
      });
    } else {
      res.status(200).json(res.advancedResults);
    }
  }
);

// @desc      Get single cook book
// @route     GET /api/v1/cookbooks/:id
// @access    Private
export const getCookBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let cookBook;
    if (req.params.userId) {
      cookBook = await CookBook.findOne({
        _id: req.params.id,
        user: req.params.userId,
      });
    } else {
      cookBook = await CookBook.findById(req.params.id);
    }

    if (!cookBook) {
      return next(
        new ErrorResponse(
          `Cook book not found with id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: cookBook,
    });
  }
);

// @desc      Create cook book
// @route     POST /api/v1/cookbooks
// @access    Private
export const createCookBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.params.userId) {
      req.body.user = req.params.userId;
    }
    const cookBook = await CookBook.create(req.body);

    res.status(201).json({
      success: true,
      data: cookBook,
    });
  }
);

// @desc      Update cook book
// @route     PUT /api/v1/cookbooks/:id
// @access    Private
export const updateCookBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.params.userId) {
      req.body.user = req.params.userId;
    }
    const cookBook = await CookBook.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!cookBook) {
      return next(
        new ErrorResponse(
          `Cook book not found with id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: cookBook,
    });
  }
);

// @desc      Delete cook book
// @route     DELETE /api/v1/cookbooks/:id
// @access    Private
export const deleteCookBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let cookBook;
    if (req.params.userId) {
      cookBook = await CookBook.findOneAndDelete({
        _id: req.params.id,
        user: req.params.userId,
      });
    } else {
      cookBook = await CookBook.findByIdAndDelete(req.params.id);
    }
    if (!cookBook) {
      return next(
        new ErrorResponse(
          `Cook book not found with id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

// @desc      Upload cook book photo
// @route     PUT /api/v1/cookbooks/:id/photo
// @access    Private
export const uploadPhotoCookBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      return next(new ErrorResponse("Please upload a file", 400));
    }

    const cookBook = await CookBook.findById(req.params.id);

    if (!cookBook) {
      return next(
        new ErrorResponse(
          `Cook book not found with id of ${req.params.id}`,
          404
        )
      );
    }

    const filePath = `uploads/${req.file.filename}`;

    cookBook.image = filePath;

    await cookBook.save();

    res.status(200).json({
      success: true,
      data: cookBook,
    });
  }
);
