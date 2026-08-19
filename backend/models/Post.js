import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, enum: ["image", "video", null], default: null },
    platforms: [
      {
        type: String,
        enum: ["twitter", "instagram", "linkedin", "facebook"],
        required: true,
      },
    ],
    status: { type: String, enum: ["draft", "scheduled", "published"], default: "draft" },
    scheduledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

postSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
