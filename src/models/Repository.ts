import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRepository extends Document {
  userId: mongoose.Types.ObjectId;
  githubRepoId: number;
  name: string;
  fullName: string;
  description?: string;
  htmlUrl: string;
  homepageUrl?: string;
  language?: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  isPrivate: boolean;
  defaultBranch: string;
  deployedUrl?: string;
  deploymentStatus?: string;
  updatedAtGithub?: Date;
  lastSyncedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const RepositorySchema = new Schema<IRepository>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    githubRepoId: { type: Number, required: true },
    name: { type: String },
    fullName: { type: String },
    description: { type: String },
    htmlUrl: { type: String },
    homepageUrl: { type: String },
    language: { type: String },
    stargazersCount: { type: Number, default: 0 },
    forksCount: { type: Number, default: 0 },
    openIssuesCount: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    defaultBranch: { type: String, default: "main" },
    deployedUrl: { type: String },
    deploymentStatus: { type: String },
    updatedAtGithub: { type: Date },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

RepositorySchema.index({ userId: 1, githubRepoId: 1 }, { unique: true });

const Repository: Model<IRepository> =
  mongoose.models.Repository ||
  mongoose.model<IRepository>("Repository", RepositorySchema);
export default Repository;
