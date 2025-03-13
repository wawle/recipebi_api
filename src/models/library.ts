import mongoose, { Document, Model, Schema } from "mongoose";
import { ICookBookModal } from "./cook-book";
import { IRecipeModal } from "./recipe";

export interface ILibraryModal extends Document {
  _id: string;
  id: string;
  recipe: IRecipeModal;
  cookbook: ICookBookModal;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILibrary extends Model<ILibraryModal> {}

// Mongoose Schema tanımını yapıyoruz
const LibrarySchema: Schema<ILibraryModal> = new Schema(
  {
    recipe: {
      type: mongoose.Schema.ObjectId,
      ref: "Recipe",
      required: true,
    },
    cookbook: {
      type: mongoose.Schema.ObjectId,
      ref: "CookBook",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

LibrarySchema.index({ recipe: 1, cookbook: 1 }, { unique: true });

const Library = mongoose.model<ILibraryModal, ILibrary>(
  "Library",
  LibrarySchema
);

export default Library;
