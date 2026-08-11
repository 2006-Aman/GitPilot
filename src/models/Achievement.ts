import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  userId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "trophy" },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Achievement || mongoose.model<IAchievement>("Achievement", AchievementSchema);
