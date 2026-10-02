import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve("work/workflow-lab");
const dtcgPath = path.join(root, "derived/dtcg/foundation.light.1440.tokens.json");
const proposalPath = path.join(root, "derived/shadcn-mapping.proposal.json");
const derivedDir = path.join(root, "derived");
const outputDir = path.resolve("outputs/figma-dtcg-export");

const tokens = JSON.parse(fs.readFileSync(dtcgPath, "utf8"));
const proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));

function getByPath(object, tokenPath) {
  return tokenPath.split(".").reduce((value, segment) => value?.[segment], object);
}

function unwrapReference(value) {
  const match = typeof value === "string" && value.match(/^\{(.+)\}$/);
  return match ? match[1] : null;
}

function resolveToken(tokenPath, trail = []) {
  if (trail.includes(tokenPath)) throw new Error(`Circular reference: ${[...trail, tokenPath].join(" -> ")}`);
  const token = getByPath(tokens, tokenPath);
  if (!token || !("$value" in token)) throw new Error(`Missing token: ${tokenPath}`);
  const reference = unwrapReference(token.$value);
  if (reference) return resolveToken(reference, [...trail, tokenPath]);
  return { value: token.$value, type: token.$type, leaf: tokenPath };
}

function srgbChannel(value) {
  return value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
}

function colorToHex(color) {
  const hex = [color.colorSpace === "srgb-linear" ? srgbChannel(color.components[0]) : color.components[0],
    color.colorSpace === "srgb-linear" ? srgbChannel(color.components[1]) : color.components[1],
    color.colorSpace === "srgb-linear" ? srgbChannel(color.components[2]) : color.components[2]]
    .map((channel) => Math.round(Math.max(0, Math.min(1, channel)) * 255).toString(16).padStart(2, "0"))
    .join("").toUpperCase();
  const alpha = color.alpha == null || color.alpha === 1 ? "" : Math.round(color.alpha * 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${hex}${alpha}`;
}

function present(resolved) {
  if (resolved.type === "color") return colorToHex(resolved.value);
  if (resolved.type === "dimension") return `${resolved.value.value}${resolved.value.unit}`;
  return JSON.stringify(resolved.value);
}

function resolveGroup(group) {
  return Object.fromEntries(Object.entries(group).map(([target, sourceReference]) => {
    const source = unwrapReference(sourceReference);
    const resolved = resolveToken(source);
    return [target, { source, resolvedLeaf: resolved.leaf, type: resolved.type, value: present(resolved) }];
  }));
}

const review = {
  status: "awaiting_approval",
  sourceMode: "Light / 1440",
  mapping: resolveGroup(proposal.mapping),
  preservedCustomTokens: resolveGroup(proposal.preserved_custom_tokens),
  provisionalFallbacks: {
    card: { source: "semantic.Background.Base.bg-primary", value: present(resolveToken("semantic.Background.Base.bg-primary")), rationale: "No dedicated card token; use the default elevated surface for the test." },
    "card-foreground": { source: "semantic.Text.Base.text-primary", value: present(resolveToken("semantic.Text.Base.text-primary")), rationale: "No dedicated card text token." },
    popover: { source: "semantic.Background.Base.bg-primary", value: present(resolveToken("semantic.Background.Base.bg-primary")), rationale: "No dedicated popover token; use the default elevated surface for the test." },
    "popover-foreground": { source: "semantic.Text.Base.text-primary", value: present(resolveToken("semantic.Text.Base.text-primary")), rationale: "No dedicated popover text token." }
  },
  unresolved: proposal.gaps_requiring_decision,
  warnings: [
    "Radius/Button/radius-btn-md resolves to primitives.radius.md, while its Figma description says radius/lg.",
    "Only a Light semantic mode exists, so this review does not define a dark theme.",
    "Four typography tracking values have ambiguous units and are excluded from this shadcn mapping review."
  ]
};

fs.mkdirSync(derivedDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(derivedDir, "shadcn-mapping.review.json"), JSON.stringify(review, null, 2) + "\n");

const rows = Object.entries(review.mapping).map(([target, item]) => `| \`--${target}\` | \`${item.source}\` | \`${item.value}\` |`).join("\n");
const customRows = Object.entries(review.preservedCustomTokens).map(([target, item]) => `| \`--${target}\` | \`${item.source}\` | \`${item.value}\` |`).join("\n");
const fallbackRows = Object.entries(review.provisionalFallbacks).map(([target, item]) => `| \`--${target}\` | \`${item.source}\` | \`${item.value}\` | ${item.rationale} |`).join("\n");

const markdown = `# Figma → shadcn mapping review\n\nStatus: **awaiting approval**. No CSS or Figma values have been changed.\n\n## Core mapping\n\n| shadcn token | Figma semantic source | Resolved value |\n|---|---|---|\n${rows}\n\n## Preserved component/state tokens\n\n| Custom token | Figma semantic source | Resolved value |\n|---|---|---|\n${customRows}\n\n## Provisional compatibility fallbacks\n\nThese four aliases exist only so shadcn components have the standard variables they expect; they do not add new Figma semantics.\n\n| shadcn token | Proposed source | Value | Reason |\n|---|---|---|---|\n${fallbackRows}\n\n## Known gaps and warnings\n\n${review.warnings.map((warning) => `- ${warning}`).join("\n")}\n\n## Approval decision\n\nApprove this mapping before generating theme CSS or changing Figma.\n`;
fs.writeFileSync(path.join(outputDir, "shadcn-mapping-review.md"), markdown);

const colorEntries = [...Object.entries(review.mapping), ...Object.entries(review.preservedCustomTokens)]
  .filter(([, item]) => item.type === "color")
  .filter(([name], index, entries) => entries.findIndex(([, item]) => item.value === entries[index][1].value) === index);
const width = 1100;
const rowHeight = 58;
const height = 110 + colorEntries.length * rowHeight;
const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const svgRows = colorEntries.map(([name, item], index) => {
  const y = 82 + index * rowHeight;
  const darkText = [item.value.slice(1, 3), item.value.slice(3, 5), item.value.slice(5, 7)].map((v) => parseInt(v, 16)).reduce((a, b) => a + b, 0) > 430;
  return `<rect x="34" y="${y}" width="150" height="42" rx="8" fill="${item.value}" stroke="#CBD5E1"/><text x="109" y="${y + 27}" text-anchor="middle" font-size="14" font-weight="700" fill="${darkText ? "#0F172A" : "#FFFFFF"}">${item.value}</text><text x="210" y="${y + 18}" font-size="15" font-weight="700" fill="#0F172A">--${escapeXml(name)}</text><text x="210" y="${y + 38}" font-size="13" fill="#64748B">${escapeXml(item.source)}</text>`;
}).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#FFFFFF"/><text x="34" y="40" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#0F172A">Figma → shadcn · Light theme mapping</text><text x="34" y="64" font-family="Inter, Arial, sans-serif" font-size="14" fill="#64748B">Exact resolved values from the exported Figma variables</text><g font-family="Inter, Arial, sans-serif">${svgRows}</g></svg>`;
fs.writeFileSync(path.join(outputDir, "shadcn-mapping-palette.svg"), svg);

function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function hexRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

const pngWidth = 1000;
const columns = 4;
const tileWidth = 220;
const tileHeight = 120;
const gutter = 24;
const pngRows = Math.ceil(colorEntries.length / columns);
const pngHeight = 56 + pngRows * (tileHeight + gutter) + 24;
const pixels = Buffer.alloc((pngWidth * 4 + 1) * pngHeight);
for (let y = 0; y < pngHeight; y++) {
  const rowOffset = y * (pngWidth * 4 + 1);
  pixels[rowOffset] = 0;
  for (let x = 0; x < pngWidth; x++) {
    const offset = rowOffset + 1 + x * 4;
    pixels[offset] = 248;
    pixels[offset + 1] = 250;
    pixels[offset + 2] = 252;
    pixels[offset + 3] = 255;
  }
}
colorEntries.forEach(([, item], index) => {
  const column = index % columns;
  const row = Math.floor(index / columns);
  const startX = 24 + column * (tileWidth + gutter);
  const startY = 32 + row * (tileHeight + gutter);
  const [red, green, blue] = hexRgb(item.value);
  for (let y = startY; y < startY + tileHeight; y++) {
    const rowOffset = y * (pngWidth * 4 + 1);
    for (let x = startX; x < startX + tileWidth; x++) {
      const offset = rowOffset + 1 + x * 4;
      const border = x === startX || x === startX + tileWidth - 1 || y === startY || y === startY + tileHeight - 1;
      pixels[offset] = border ? 203 : red;
      pixels[offset + 1] = border ? 213 : green;
      pixels[offset + 2] = border ? 225 : blue;
      pixels[offset + 3] = 255;
    }
  }
});
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(pngWidth, 0);
ihdr.writeUInt32BE(pngHeight, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  pngChunk("IHDR", ihdr),
  pngChunk("IDAT", zlib.deflateSync(pixels)),
  pngChunk("IEND", Buffer.alloc(0))
]);
fs.writeFileSync(path.join(outputDir, "shadcn-mapping-palette.png"), png);

console.log(`Created review with ${Object.keys(review.mapping).length} core mappings and ${colorEntries.length} unique color swatches.`);
