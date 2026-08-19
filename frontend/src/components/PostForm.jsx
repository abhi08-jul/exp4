import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PlatformSelect from "./PlatformSelect.jsx";
import { strictestLimit, getPlatform } from "../store/platforms.js";
import api from "../api/axios.js";

const MAX_IMAGE_MB = 1;
const MAX_VIDEO_MB = 12;

const PostForm = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [status, setStatus] = useState("draft");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [mediaError, setMediaError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = useMemo(
    () => strictestLimit(platforms),
    [platforms]
  );

  const charsLeft =
    limit === Infinity ? null : limit - description.length;

  const overLimit =
    charsLeft !== null && charsLeft < 0;

  // 3D tilt effect
  const handleTilt = (e) => {
    const card = cardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX =
      ((y - rect.height / 2) / rect.height) * -6;

    const rotateY =
      ((x - rect.width / 2) / rect.width) * 6;

    card.style.transform = `perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.01)`;
  };

  const resetTilt = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setMediaError("");

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    const isVideo =
      selectedFile.type.startsWith("video");

    const maxBytes =
      (isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB) *
      1024 *
      1024;

    if (selectedFile.size > maxBytes) {
      setMediaError(
        `${isVideo ? "Video" : "Image"} exceeds ${isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB
        }MB limit`
      );

      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setPreview(
      URL.createObjectURL(selectedFile)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setSuccess("");

    if (
      !title.trim() ||
      !description.trim() ||
      platforms.length === 0
    ) {
      setSubmitError(
        "Title, description and at least one platform are required"
      );
      return;
    }

    if (overLimit) {
      setSubmitError(
        `Description exceeds the ${limit}-character limit for selected platform(s)`
      );
      return;
    }

    // Scheduled posts must have date and time
    if (status === "scheduled") {
      if (!scheduledDate || !scheduledTime) {
        setSubmitError(
          "Please select both schedule date and time"
        );
        return;
      }

      const selectedDateTime = new Date(
        `${scheduledDate}T${scheduledTime}`
      );

      if (selectedDateTime <= new Date()) {
        setSubmitError(
          "Scheduled date and time must be in the future"
        );
        return;
      }
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);

    platforms.forEach((platform) => {
      formData.append("platforms", platform);
    });

    formData.append("status", status);

    if (status === "scheduled") {
      const scheduledAt = new Date(
        `${scheduledDate}T${scheduledTime}`
      ).toISOString();

      formData.append(
        "scheduledAt",
        scheduledAt
      );
    }

    if (file) {
      formData.append("media", file);
    }

    try {
      setLoading(true);

      await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(
        status === "scheduled"
          ? "Post scheduled successfully!"
          : "Post created successfully!"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      <h1 className="font-display text-3xl font-800 mb-2">
        Compose a post
      </h1>

      <p className="text-gray-400 mb-8">
        Write once, adapt automatically to every platform's rules.
      </p>

      <form
        ref={cardRef}
        onMouseMove={handleTilt}
        onMouseLeave={resetTilt}
        onSubmit={handleSubmit}
        className="glass tilt-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl"
      >

        {/* TITLE */}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title of post
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="e.g. Launching our new feature 🚀"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accentTo transition"
          />
        </div>

        {/* MEDIA */}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image / Video{" "}
            <span className="text-gray-500">
              (optional — image max 1MB, video max 12MB)
            </span>
          </label>

          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accentFrom/20 file:text-accentTo hover:file:bg-accentFrom/30"
          />

          {mediaError && (
            <p className="text-red-400 text-xs mt-2">
              {mediaError}
            </p>
          )}

          {preview && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10 max-h-52">

              {file.type.startsWith("video") ? (
                <video
                  src={preview}
                  controls
                  className="w-full max-h-52 object-cover"
                />
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-52 object-cover"
                />
              )}

            </div>
          )}
        </div>

        {/* PLATFORMS */}

        <PlatformSelect
          selected={platforms}
          onChange={setPlatforms}
        />

        {/* DESCRIPTION */}

        <div>

          <div className="flex items-center justify-between mb-2">

            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>

            {charsLeft !== null && (
              <span
                className={`text-xs font-medium ${overLimit
                    ? "text-red-400"
                    : charsLeft < 30
                      ? "text-yellow-400"
                      : "text-gray-500"
                  }`}
              >
                {charsLeft} chars left
              </span>
            )}

          </div>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={5}
            placeholder="Write your post copy here..."
            className={`w-full bg-black/30 border rounded-xl px-4 py-3 outline-none transition resize-none ${overLimit
                ? "border-red-500"
                : "border-white/10 focus:border-accentTo"
              }`}
          />

          {platforms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">

              {platforms.map((id) => {

                const p = getPlatform(id);

                return (
                  <span
                    key={id}
                    className="text-[11px] px-2 py-1 rounded-full"
                    style={{
                      background: `${p.color}22`,
                      color: p.color,
                    }}
                  >
                    {p.label}: {p.charLimit} chars ·{" "}
                    {p.hashtagNote}
                  </span>
                );

              })}

            </div>
          )}

        </div>

        {/* SCHEDULING */}

        <div className="border border-white/10 rounded-xl p-5 space-y-4">

          <div>
            <h3 className="font-display text-lg font-semibold">
              Schedule Post
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Choose whether to save the post as a draft or schedule it for a specific time.
            </p>
          </div>

          {/* STATUS */}

          <div>

            <label className="block text-sm font-medium text-gray-300 mb-2">
              Post Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accentTo"
            >

              <option value="draft">
                Draft
              </option>

              <option value="scheduled">
                Scheduled
              </option>

            </select>

          </div>

          {/* DATE + TIME */}

          {status === "scheduled" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>

                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Schedule Date
                </label>

                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) =>
                    setScheduledDate(e.target.value)
                  }
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accentTo"
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Schedule Time
                </label>

                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) =>
                    setScheduledTime(e.target.value)
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accentTo"
                />

              </div>

            </div>
          )}

        </div>

        {/* ERRORS */}

        {submitError && (
          <p className="text-red-400 text-sm">
            {submitError}
          </p>
        )}

        {success && (
          <p className="text-green-400 text-sm">
            {success}
          </p>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={loading}
          className="gradient-btn w-full py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : status === "scheduled"
              ? "Schedule Post"
              : "Create Draft"}
        </button>

      </form>

    </div>
  );
};

export default PostForm;