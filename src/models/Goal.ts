import mongoose, { Schema, Document } from "mongoose";

export interface IGoal extends Document {
  userId: string;
  title: string;
  category: string;
  target: number;
  current: number;
  deadline: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, default: "General" },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    deadline: { type: Date },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
