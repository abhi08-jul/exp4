// Central config for platform-specific constraints — single source of truth
// used by both the form validator and the UI badges/dropdown.
export const PLATFORMS = [
  {
    id: "twitter",
    label: "Twitter / X",
    color: "#1DA1F2",
    charLimit: 280,
    supportsVideo: true,
    hashtagNote: "Keep hashtags to 1–2 for best reach",
  },
  {
    id: "instagram",
    label: "Instagram",
    color: "#E1306C",
    charLimit: 2200,
    supportsVideo: true,
    hashtagNote: "Up to 30 hashtags allowed",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    charLimit: 3000,
    supportsVideo: true,
    hashtagNote: "3–5 relevant hashtags recommended",
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    charLimit: 5000,
    supportsVideo: true,
    hashtagNote: "Hashtags have minimal impact on reach",
  },
];

export const getPlatform = (id) => PLATFORMS.find((p) => p.id === id);

// Strictest char limit among a set of selected platform ids
export const strictestLimit = (ids) => {
  if (!ids.length) return Infinity;
  return Math.min(...ids.map((id) => getPlatform(id)?.charLimit ?? Infinity));
};
