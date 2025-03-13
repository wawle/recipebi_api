import { Response } from "express";
import ErrorResponse from "../utils/error-response";
import asyncHandler from "../middleware/async";
import User, { IUserModal } from "../models/user"; // Assuming IUser is the User interface
import { RequestWithUser } from "../middleware/auth";
import { sendEmail } from "../utils/send-email";
import crypto from "crypto";

// Define a type for the request body for registration
interface RegisterRequestBody {
  fullname: string;
  email: string;
  phone: string;
  password: string;
}

// Define a type for the request body for login
interface LoginRequestBody {
  phone: string;
  password: string;
}

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
export const register = asyncHandler(async (req, res) => {
  const { fullname, email, phone, password } = req.body as RegisterRequestBody;

  // Create user
  const user = await User.create({
    fullname,
    email,
    phone,
    password,
  });

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
export const login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body as LoginRequestBody;

  // Validate phone & password
  if (!phone || !password) {
    return next(new ErrorResponse("Please provide a phone and password", 400));
  }

  // Check for user
  const user = await User.findOne({ phone }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById((req as RequestWithUser).user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
export const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(
    (req as RequestWithUser).user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById((req as RequestWithUser).user.id).select(
    "+password"
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (
  user: IUserModal,
  statusCode: number,
  res: Response
) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_EXPIRE as string) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        photo: user.photo,
        isVerified: user.isVerified,
      },
    });
};

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

export const sendVerificationCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const message = `Your verification code is ${verificationCode}`;
  const options = {
    email: user.email,
    subject: "Verification code",
    message,
  };

  try {
    await sendEmail(options);
    user.verificationCode = verificationCode;
    user.verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }

  res.status(200).json({ success: true, data: "Verification code sent" });
});

export const verifyUser = asyncHandler(async (req, res, next) => {
  const { email, verificationCode } = req.body;

  const user = await User.findOne({
    email,
    verificationCode,
    verificationCodeExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid verification code", 400));
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: "Verification code verified" });
});
