import { PLATFORMS } from "../store/platforms.js";

// Multi-select platform picker rendered as toggle chips (dropdown-style panel)
const PlatformSelect = ({ selected, onChange }) => {
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select platform(s) <span className="text-red-400">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PLATFORMS.map((p) => {
          const active = selected.includes(p.id);
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`relative rounded-xl px-3 py-3 border text-sm font-medium transition-all duration-200
                ${active
                  ? "border-transparent text-white shadow-lg"
                  : "border-white/10 text-gray-400 hover:border-white/30"}`}
              style={active ? { background: p.color, boxShadow: `0 8px 20px ${p.color}55` } : {}}
            >
              {p.label}
              {active && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {selected.length} platform{selected.length > 1 ? "s" : ""} selected — character limit will
          follow the strictest one.
        </p>
      )}
    </div>
  );
};

export default PlatformSelect;
