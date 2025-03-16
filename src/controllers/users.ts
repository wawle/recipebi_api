import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import asyncHandler from "../middleware/async";
import ErrorResponse from "../utils/error-response";
import path from "path";
import { Role } from "../utils/enums";

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Public
export const getUsers = asyncHandler(
  async (req: Request, res: any, next: NextFunction): Promise<void> => {
    res.status(200).json(res.advancedResults);
  }
);

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Public
export const getUser = asyncHandler(
  async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    // check requested user is current user or admin
    if (
      user._id.toString() !== req.user._id.toString() &&
      req.user.role !== Role.Admin
    ) {
      return next(
        new ErrorResponse("Bu işlemi yapmak için yeterince yetkiniz yok", 403)
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc      Create user
// @route     POST /api/v1/users
// @access    Public
export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  }
);

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Public
export const updateUser = asyncHandler(
  async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    // check requested user is current user or admin
    if (
      user._id.toString() !== req.user._id.toString() &&
      req.user.role !== Role.Admin
    ) {
      return next(
        new ErrorResponse("Bu işlemi yapmak için yeterince yetkiniz yok", 403)
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Public
export const deleteUser = asyncHandler(
  async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    // check requested user is current user or admin
    if (
      user._id.toString() !== req.user._id.toString() &&
      req.user.role !== Role.Admin
    ) {
      return next(
        new ErrorResponse("Bu işlemi yapmak için yeterince yetkiniz yok", 403)
      );
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

// @desc      Upload user photo
// @route     PUT /api/v1/users/:id/photo
// @access    Private
export const uploadPhotoUser = asyncHandler(
  async (req: any, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      return next(new ErrorResponse("Lütfen bir fotoğraf yükleyin", 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`${req.params.id} ID'li kullanıcı bulunamadı`, 404)
      );
    }

    // check requested user is current user or admin
    if (
      user._id.toString() !== req.user._id.toString() &&
      req.user.role !== Role.Admin
    ) {
      return next(
        new ErrorResponse("Bu işlemi yapmak için yeterince yetkiniz yok", 403)
      );
    }

    // Dosya yolunu oluştur - Docker içinde çalışmaya uygun formatta
    const filePath = `uploads/${req.file.filename}`;

    // Kullanıcı fotoğrafını güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { photo: filePath },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
      filePath: filePath, // Dosya yolunu döndür
    });
  }
);
