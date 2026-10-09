/**
 * Rewrite imports of @heygen/streaming-avatar to the local LiveAvatar compat
 * layer across app/, components/, lib/. Also rewrites remaining enum references
 * that the compat layer does not export (VoiceChatTransport etc. stay exported).
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DIRS = ["app", "components", "lib"];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

let changed = [];
for (const d of DIRS) {
  const abs = path.join(ROOT, d);
  if (!fs.existsSync(abs)) continue;
  for (const f of walk(abs)) {
    let src = fs.readFileSync(f, "utf8");
    const orig = src;
    src = src.replace(
      /from ["']@heygen\/streaming-avatar["'];?/g,
      'from "@/lib/legacy/streaming-avatar-compat";',
    );
    src = src.replace(
      /import StreamingAvatar,/g,
      "import StreamingAvatarCompat,",
    );
    if (src !== orig) {
      fs.writeFileSync(f, src);
      changed.push(path.relative(ROOT, f));
    }
  }
}
console.log("rewired files:");
console.log(changed.join("\n") || "(none)");
