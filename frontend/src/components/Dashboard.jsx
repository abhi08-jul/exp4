import {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

import api from "../api/axios.js";

import { PLATFORMS } from "../store/platforms.js";

import {
  selectFilteredPosts,
  selectPostsByDate,
  selectAnalytics,
} from "../store/selectors.js";

import AnalyticsChart from "./AnalyticsChart.jsx";
import CalendarView from "./CalendarView.jsx";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // PERFORMANCE: Stable API function
  // ==========================================
  const fetchPosts = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // Fetch posts once on mount
  // ==========================================
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ==========================================
  // PERFORMANCE: Memoized selector state
  // ==========================================
  const state = useMemo(
    () => ({
      posts,
      platformFilter,
      statusFilter,
      searchTerm,
    }),
    [
      posts,
      platformFilter,
      statusFilter,
      searchTerm,
    ]
  );

  // ==========================================
  // PERFORMANCE: Memoized filtered posts
  // ==========================================
  const filteredPosts = useMemo(
    () => selectFilteredPosts(state),
    [state]
  );

  // ==========================================
  // PERFORMANCE: Memoized posts by date
  // ==========================================
  const postsByDate = useMemo(
    () => selectPostsByDate(state),
    [state]
  );

  // Prevent unused-variable warnings while
  // keeping the selector available for future UI
  void postsByDate;

  // ==========================================
  // PERFORMANCE: Memoized analytics
  // ==========================================
  const analytics = useMemo(
    () => selectAnalytics({ posts }),
    [posts]
  );

  // ==========================================
  // PERFORMANCE: Stable delete function
  // ==========================================
  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Delete this post?")) {
        return;
      }

      try {
        await api.delete(`/posts/${id}`);
        await fetchPosts();
      } catch (err) {
        console.error(
          "Failed to delete post:",
          err
        );
      }
    },
    [fetchPosts]
  );

  // ==========================================
  // API base URL
  // ==========================================
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5007";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accentTo mb-2">
            Content Management
          </p>

          <h1 className="font-display text-3xl sm:text-4xl font-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            Plan, schedule and manage your social media content.
          </p>
        </div>

        {/* ================= FILTERS ================= */}

        <div className="flex flex-wrap gap-2">

          <select
            value={platformFilter}
            onChange={(e) =>
              setPlatformFilter(e.target.value)
            }
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accentTo"
          >
            <option value="all">
              All platforms
            </option>

            {PLATFORMS.map((p) => (
              <option
                key={p.id}
                value={p.id}
              >
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accentTo"
          >
            <option value="all">
              All status
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="published">
              Published
            </option>
          </select>

          <input
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search posts..."
            className="w-full sm:w-44 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accentTo"
          />

        </div>
      </div>

      {/* ================= QUICK STATS ================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Total Posts
          </p>

          <p className="text-3xl font-bold mt-2">
            {analytics.total}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            All created content
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Scheduled
          </p>

          <p className="text-3xl font-bold mt-2">
            {analytics.byStatus.scheduled || 0}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Upcoming posts
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Published
          </p>

          <p className="text-3xl font-bold mt-2">
            {analytics.byStatus.published || 0}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Successfully published
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Drafts
          </p>

          <p className="text-3xl font-bold mt-2">
            {analytics.byStatus.draft || 0}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Work in progress
          </p>
        </div>

      </div>

      {/* ================= ANALYTICS + CALENDAR ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">

        {/* ================= LEFT ANALYTICS ================= */}

        <div className="xl:col-span-4 space-y-6">

          <AnalyticsChart
            analytics={analytics}
          />

          <div className="glass rounded-2xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h3 className="font-display text-lg font-bold">
                  Status Breakdown
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Content distribution
                </p>
              </div>

            </div>

            <div className="space-y-4">

              {[
                ["draft", "Draft"],
                ["scheduled", "Scheduled"],
                ["published", "Published"],
              ].map(([key, label]) => {

                const count =
                  analytics.byStatus[key] || 0;

                const percentage =
                  analytics.total > 0
                    ? Math.round(
                      (count /
                        analytics.total) *
                      100
                    )
                    : 0;

                return (
                  <div key={key}>

                    <div className="flex items-center justify-between text-sm mb-2">

                      <span className="text-gray-400">
                        {label}
                      </span>

                      <span className="font-semibold">
                        {count}
                      </span>

                    </div>

                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* ================= RIGHT CALENDAR ================= */}

        <div className="xl:col-span-8">

          <CalendarView
            posts={posts}
            onPostUpdated={fetchPosts}
          />

        </div>

      </div>

      {/* ================= POSTS ================= */}

      <div className="mb-5">

        <div className="flex items-end justify-between">

          <div>

            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-1">
              Content Library
            </p>

            <h2 className="font-display text-2xl font-bold">
              Your Posts
            </h2>

          </div>

          <span className="text-xs text-gray-500">
            {filteredPosts.length} result
            {filteredPosts.length !== 1
              ? "s"
              : ""}
          </span>

        </div>

      </div>

      {/* ================= LOADING / EMPTY / POSTS ================= */}

      {loading ? (

        <div className="glass rounded-2xl p-12 text-center">

          <p className="text-gray-500">
            Loading posts...
          </p>

        </div>

      ) : filteredPosts.length === 0 ? (

        <div className="glass rounded-2xl p-12 text-center">

          <div className="text-4xl mb-3">
            📝
          </div>

          <h3 className="font-semibold text-lg">
            No posts found
          </h3>

          <p className="text-gray-500 text-sm mt-1">
            Create a post or change your filters.
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredPosts.map((post) => (

            <div
              key={post._id}
              className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >

              {/* ================= MEDIA ================= */}

              {post.mediaUrl && (

                <div className="h-44 overflow-hidden bg-black/20">

                  {post.mediaType === "video" ? (

                    <video
                      src={`${API_BASE}${post.mediaUrl}`}
                      className="w-full h-full object-cover"
                      controls
                    />

                  ) : (

                    <img
                      src={`${API_BASE}${post.mediaUrl}`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />

                  )}

                </div>

              )}

              {/* ================= CONTENT ================= */}

              <div className="p-5">

                <div className="flex items-start justify-between gap-3">

                  <h4 className="font-semibold text-base truncate">
                    {post.title}
                  </h4>

                  <span className="text-[10px] uppercase tracking-wide text-gray-500 whitespace-nowrap">
                    {post.status}
                  </span>

                </div>

                <p className="text-sm text-gray-400 line-clamp-3 mt-2 mb-4">
                  {post.description}
                </p>

                {/* ================= PLATFORMS ================= */}

                <div className="flex flex-wrap gap-1.5 mb-4">

                  {post.platforms.map((pid) => {

                    const p =
                      PLATFORMS.find(
                        (x) => x.id === pid
                      );

                    if (!p) return null;

                    return (
                      <span
                        key={pid}
                        className="text-[11px] px-2.5 py-1 rounded-full"
                        style={{
                          background:
                            `${p.color}22`,
                          color:
                            p.color,
                        }}
                      >
                        {p.label}
                      </span>
                    );

                  })}

                </div>

                {/* ================= FOOTER ================= */}

                <div className="flex items-center justify-between border-t border-white/5 pt-3">

                  <div className="text-xs text-gray-500">

                    {post.scheduledAt ? (

                      <>
                        Scheduled{" "}
                        {new Date(
                          post.scheduledAt
                        ).toLocaleDateString()}
                      </>

                    ) : (

                      "Created " +
                      new Date(
                        post.createdAt
                      ).toLocaleDateString()

                    )}

                  </div>

                  <button
                    onClick={() =>
                      handleDelete(post._id)
                    }
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default Dashboard;