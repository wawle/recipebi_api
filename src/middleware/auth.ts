import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "./async";
import ErrorResponse from "../utils/error-response";
import User, { IUserModal } from "../models/user";

// Extend Express Request to include user property
export interface RequestWithUser extends Request {
  user: IUserModal;
}

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    // Or check for the token in the cookies
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Attach user to the request
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    (req as RequestWithUser).user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;
    if (!roles.includes(user.role)) {
      return next(
        new ErrorResponse(
          `User role (${user.role}) is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
