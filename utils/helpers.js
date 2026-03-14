function toInt(v, fallback = 0) {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

function str(v) {
  return (v ?? "").toString();
}

function normLower(v) {
  return (v ?? "").toString().trim().toLowerCase();
}

function sanitizeFilenamePart(s) {
  return (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[\/\\:*?"<>|]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

function prettyTopicForFilename(s) {
  return (s ?? "")
    .toString()
    .trim()
    .replace(/[\/\\:*?"<>|]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

module.exports = {
  toInt,
  str,
  normLower,
  sanitizeFilenamePart,
  prettyTopicForFilename,
};