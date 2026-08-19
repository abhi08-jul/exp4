import { PLATFORMS } from "../store/platforms.js";

// Lightweight CSS-bar analytics — no external chart lib needed
const AnalyticsChart = ({ analytics }) => {
  const max = Math.max(1, ...Object.values(analytics.byPlatform));

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-lg font-700 mb-4">Posts per platform</h3>
      <div className="space-y-3">
        {PLATFORMS.map((p) => {
          const count = analytics.byPlatform[p.id] || 0;
          const pct = (count / max) * 100;
          return (
            <div key={p.id}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: p.color }}>{p.label}</span>
                <span className="text-gray-400">{count}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: p.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-sm">
        <span className="text-gray-400">Total posts</span>
        <span className="font-semibold gradient-text">{analytics.total}</span>
      </div>
    </div>
  );
};

export default AnalyticsChart;
