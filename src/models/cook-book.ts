import mongoose, { Document, Model, Schema } from "mongoose";
import { IUserModal } from "./user";
import { IRecipeModal } from "./recipe";

export interface ICookBookModal extends Document {
  _id: string;
  id: string;
  name: string;
  image: string;
  description?: string;
  user: IUserModal;
  recipes: IRecipeModal[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICookBook extends Model<ICookBookModal> {}

// Mongoose Schema tanımını yapıyoruz
const CookBookSchema: Schema<ICookBookModal> = new Schema(
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
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CookBookSchema.index({ name: "text", description: "text" });

CookBookSchema.index({ user: 1, _id: 1 }, { unique: true });

CookBookSchema.virtual("recipes", {
  ref: "Library",
  localField: "_id",
  foreignField: "cookbook",
  justOne: false,
});

// Mongoose modelini dışa aktarıyoruz
const CookBook = mongoose.model<ICookBookModal, ICookBook>(
  "CookBook",
  CookBookSchema
);

export default CookBook;
