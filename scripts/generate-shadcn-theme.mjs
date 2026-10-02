import fs from "node:fs";
import path from "node:path";

const root = path.resolve("work/workflow-lab");
const outputDir = path.resolve("outputs/figma-dtcg-export");
const review = JSON.parse(fs.readFileSync(path.join(root, "derived/shadcn-mapping.review.json"), "utf8"));

const requiredCore = [
  "background", "foreground", "primary", "primary-foreground", "secondary",
  "secondary-foreground", "muted", "muted-foreground", "accent",
  "accent-foreground", "destructive", "destructive-foreground", "border",
  "input", "ring", "radius"
];

for (const name of requiredCore) {
  if (!review.mapping[name]) throw new Error(`Missing approved mapping: ${name}`);
}

const aliases = {
  ...review.mapping,
  ...Object.fromEntries(Object.entries(review.provisionalFallbacks).map(([name, item]) => [name, item]))
};

const rootOrder = [
  "radius", "background", "foreground", "card", "card-foreground", "popover",
  "popover-foreground", "primary", "primary-foreground", "secondary",
  "secondary-foreground", "muted", "muted-foreground", "accent",
  "accent-foreground", "destructive", "destructive-foreground", "border", "input", "ring"
];

const sourceComment = (item) => item.source ? ` /* ${item.source} */` : "";
const rootLines = rootOrder.map((name) => `  --${name}: ${aliases[name].value};${sourceComment(aliases[name])}`);
const customLines = Object.entries(review.preservedCustomTokens)
  .map(([name, item]) => `  --${name}: ${item.value};${sourceComment(item)}`);

const colorThemeNames = rootOrder.filter((name) => name !== "radius");
const customThemeNames = Object.keys(review.preservedCustomTokens);
const themeLines = [...colorThemeNames, ...customThemeNames]
  .map((name) => `  --color-${name}: var(--${name});`);

const css = `/*
 * Generated from the approved Figma → DTCG → shadcn mapping.
 * Source file: Prototype UI Library (Light mode, 1440 token bundle).
 * This is a theme fragment: place it after Tailwind/shadcn imports in globals.css.
 * Dark mode, chart tokens, and sidebar tokens are intentionally deferred.
 */

@theme inline {
${themeLines.join("\n")}

  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
${rootLines.join("\n")}

  /* Preserved component and status roles from the Figma system. */
${customLines.join("\n")}
}
`;

fs.mkdirSync(outputDir, { recursive: true });
const cssPath = path.join(outputDir, "prototype-ui-shadcn-theme.css");
fs.writeFileSync(cssPath, css);

const defined = new Set([...rootOrder, ...customThemeNames]);
const referenced = [...css.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((match) => match[1]);
const unresolved = [...new Set(referenced.filter((name) => !defined.has(name)))];
const declarations = [...css.matchAll(/^\s*--([a-z0-9-]+):/gm)].map((match) => match[1]);
function luminance(hex) {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)]
    .map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrast(first, second) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}
const contrastPairs = [
  ["background", "foreground"], ["card", "card-foreground"],
  ["popover", "popover-foreground"], ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"], ["muted", "muted-foreground"],
  ["accent", "accent-foreground"], ["destructive", "destructive-foreground"]
].map(([surface, foreground]) => ({
  pair: `${surface} / ${foreground}`,
  ratio: contrast(aliases[surface].value, aliases[foreground].value),
  passesWcagAaNormalText: contrast(aliases[surface].value, aliases[foreground].value) >= 4.5
}));
const duplicateRootValues = rootOrder
  .map((name) => [name, aliases[name].value])
  .filter(([, value], index, all) => all.findIndex(([, candidate]) => candidate === value) !== index)
  .map(([name, value]) => ({ name, value }));

const validation = {
  valid: unresolved.length === 0,
  generatedAt: "2026-09-25",
  sourceMode: review.sourceMode,
  rootTokenCount: rootOrder.length,
  preservedCustomTokenCount: customThemeNames.length,
  declarationCount: declarations.length,
  unresolvedReferences: unresolved,
  contrastPairs,
  intentionalSharedValues: duplicateRootValues,
  deferred: ["dark mode", "chart-1…chart-5", "sidebar token family"]
};

fs.writeFileSync(path.join(outputDir, "prototype-ui-shadcn-theme.validation.json"), JSON.stringify(validation, null, 2) + "\n");

const usage = `# Using the Prototype UI theme with shadcn/ui

## What this file does

The theme maps the approved Figma semantic Variables to the CSS Variables used by shadcn/ui. Card and popover intentionally reuse the light \`bg-primary\` surface (\`#FFFFFF\`).

## Add it to a project

1. Initialize shadcn/ui with CSS Variables enabled, or verify that \`tailwind.cssVariables\` is \`true\` in \`components.json\`.
2. Copy the contents of \`prototype-ui-shadcn-theme.css\` into the global CSS file configured in \`components.json\`, after the Tailwind and shadcn imports.
3. Keep any project-specific chart or sidebar tokens already present. This pilot deliberately does not replace them.
4. Verify Button, Input, Select, Checkbox, Radio, Switch, Toggle, Tabs, Dropdown, Card, and Popover in the browser.

## Important limitation

The theme changes semantic values, but it does not automatically reproduce every Figma component recipe. For example, the Figma Secondary Button uses a white background and depends on its border styling. That component-level alignment is the next workflow phase.

## Deferred

- Dark mode: the Figma Semantic collection currently has only Light mode.
- Chart palette: outside the approved base-component scope.
- Sidebar family: outside the approved base-component scope.
`;
fs.writeFileSync(path.join(outputDir, "shadcn-theme-usage.md"), usage);

if (!validation.valid) throw new Error(`Unresolved CSS references: ${unresolved.join(", ")}`);
console.log(JSON.stringify(validation, null, 2));
