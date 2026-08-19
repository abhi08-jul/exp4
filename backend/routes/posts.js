import express from "express";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

const PLATFORM_LIMITS = {
  twitter: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 5000,
};

// @route POST /api/posts
router.post("/", protect, upload.single("media"), async (req, res) => {
  try {
    const {
      title,
      description,
      platforms,
      status,
      scheduledAt,
    } = req.body;

    const platformArr = Array.isArray(platforms)
      ? platforms
      : JSON.parse(platforms || "[]");

    if (!title || !description || platformArr.length === 0) {
      return res.status(400).json({
        message:
          "Title, description and at least 1 platform are required",
      });
    }

    // Enforce strictest character limit
    const minLimit = Math.min(
      ...platformArr.map(
        (p) => PLATFORM_LIMITS[p] || Infinity
      )
    );

    if (description.length > minLimit) {
      return res.status(400).json({
        message: `Description exceeds ${minLimit} character limit for selected platform(s)`,
      });
    }

    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith("video")
        ? "video"
        : "image";
    }

    const post = await Post.create({
      user: req.userId,
      title,
      description,
      platforms: platformArr,
      mediaUrl,
      mediaType,
      status: status || "draft",
      scheduledAt: scheduledAt || null,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// @route GET /api/posts
router.get("/", protect, async (req, res) => {
  try {
    const { platform } = req.query;

    const query = {
      user: req.userId,
    };

    if (platform && platform !== "all") {
      query.platforms = platform;
    }

    const posts = await Post.find(query).sort({
      createdAt: -1,
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// @route GET /api/posts/analytics
router.get("/analytics", protect, async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.userId,
    });

    const byPlatform = {};
    const byStatus = {};

    posts.forEach((p) => {
      p.platforms.forEach((pf) => {
        byPlatform[pf] =
          (byPlatform[pf] || 0) + 1;
      });

      byStatus[p.status] =
        (byStatus[p.status] || 0) + 1;
    });

    res.json({
      total: posts.length,
      byPlatform,
      byStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// @route PATCH /api/posts/:id
// Update scheduled date/time or status
router.patch("/:id", protect, async (req, res) => {
  try {
    const {
      scheduledAt,
      status,
    } = req.body;

    const post = await Post.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (scheduledAt !== undefined) {
      post.scheduledAt = scheduledAt;
    }

    if (status !== undefined) {
      post.status = status;
    }

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// @route DELETE /api/posts/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await post.deleteOne();

    res.json({
      message: "Post deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;