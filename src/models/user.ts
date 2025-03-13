import mongoose, { Document, Model, Schema } from "mongoose";
import { Role } from "../utils/enums";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import CookBook, { ICookBookModal } from "./cook-book";

export interface IUserModal extends Document {
  _id: string;
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: Role;
  photo: string;

  password?: string;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  verificationCode?: string;
  verificationCodeExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  cookBooks?: ICookBookModal[];

  // Instance methods
  getSignedJwtToken(): string;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
  getVerificationCode(): string;
}

// Define static methods
export interface IUser extends Model<IUserModal> {}

// Mongoose Schema tanımını yapıyoruz
const UserSchema: Schema<IUserModal> = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please add a fullname"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
      unique: true,
      match: [/^\+[1-9]\d{1,14}$/, "Please add a valid phone number"],
    },
    role: {
      type: String,
      enum: [Role.Admin, Role.Manager, Role.User],
      default: Role.User,
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationCode: String,
    verificationCodeExpire: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } // createdAt ve updatedAt alanlarını otomatik olarak ekler
);

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as any, {
    expiresIn: process.env.JWT_EXPIRE as any,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.getVerificationCode = function () {
  const verificationCode = crypto.randomBytes(6).toString("hex");
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000;
  return verificationCode;
};

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const password = this.password as string;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
});

UserSchema.post("save", async function (next) {
  await CookBook.create({
    user: this._id,
    name: `${this.fullname} CookBook`,
  });
});

// Mongoose modelini dışa aktarıyoruz
const User = mongoose.model<IUserModal, IUser>("User", UserSchema);

export default User;
