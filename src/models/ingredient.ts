import mongoose, { Document, Model, Schema } from "mongoose";

export interface IIngredientModal extends Document {
  _id: string;
  name: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIngredient extends Model<IIngredientModal> {}

const IngredientSchema: Schema<IIngredientModal> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

IngredientSchema.index({ name: "text" });

const Ingredient = mongoose.model<IIngredientModal, IIngredient>(
  "Ingredient",
  IngredientSchema
);

export default Ingredient;
