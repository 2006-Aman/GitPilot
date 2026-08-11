import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  githubId: string;
  githubUsername: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    githubId: { type: String, required: true, unique: true },
    githubUsername: { type: String },
    name: { type: String },
    email: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
