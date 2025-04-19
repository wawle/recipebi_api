import mongoose, { Document, Model, Schema } from "mongoose";
import { IUserModal } from "./user";
import { Difficulty } from "../utils/enums";
import { DietType } from "../utils/enums";
import { CuisineType, MealType } from "../utils/enums";

export interface IRecipeModal extends Document {
  _id: string;
  id: string;
  name: string;
  image: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  user: IUserModal;
  details: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecipe extends Model<IRecipeModal> {}

// Define static methods

// Mongoose Schema tanımını yapıyoruz
const RecipeSchema: Schema<IRecipeModal> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: "no-photo.jpg",
    },
    ingredients: {
      type: [String],
      required: [true, "Please add ingredients"],
    },
    instructions: {
      type: [String],
      required: [true, "Please add instructions"],
    },
    details: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

RecipeSchema.index({ name: "text", description: "text" });

RecipeSchema.index({ user: 1, _id: 1 }, { unique: true });

RecipeSchema.virtual("cookbooks", {
  ref: "Library",
  localField: "_id",
  foreignField: "recipe",
  justOne: false,
});

// Mongoose modelini dışa aktarıyoruz
const Recipe = mongoose.model<IRecipeModal, IRecipe>(
  "Recipe",
  RecipeSchema
);

export default Recipe;
