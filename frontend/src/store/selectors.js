import { createSelector } from "reselect";

// Base selectors — raw inputs
const getPosts = (state) => state.posts;
const getPlatformFilter = (state) => state.platformFilter;
const getStatusFilter = (state) => state.statusFilter;
const getSearchTerm = (state) => state.searchTerm;

// Memoized: only recomputes when posts or platformFilter actually change,
// so large post lists don't get re-filtered on every unrelated re-render.
export const selectFilteredPosts = createSelector(
  [getPosts, getPlatformFilter, getStatusFilter, getSearchTerm],
  (posts, platformFilter, statusFilter, searchTerm) => {
    return posts.filter((p) => {
      const platformMatch = platformFilter === "all" || p.platforms.includes(platformFilter);
      const statusMatch = statusFilter === "all" || p.status === statusFilter;
      const searchMatch =
        !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase());
      return platformMatch && statusMatch && searchMatch;
    });
  }
);

// Memoized: groups posts by day (YYYY-MM-DD) for the calendar view
export const selectPostsByDate = createSelector([selectFilteredPosts], (posts) => {
  const grouped = {};
  posts.forEach((p) => {
    const key = new Date(p.createdAt).toISOString().slice(0, 10);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });
  return grouped;
});

// Memoized: derives per-platform + per-status counts for the analytics dashboard
export const selectAnalytics = createSelector([getPosts], (posts) => {
  const byPlatform = {};
  const byStatus = {};
  posts.forEach((p) => {
    p.platforms.forEach((pf) => {
      byPlatform[pf] = (byPlatform[pf] || 0) + 1;
    });
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  });
  return { total: posts.length, byPlatform, byStatus };
});
