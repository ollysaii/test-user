import fs from "node:fs"
import path from "node:path"

const mappingPath = path.resolve("mappings/test-project-2-shadcn.mapping.proposal.json")
const themePath = path.resolve("theme/test-project-2-shadcn-theme.css")
const validationPath = path.resolve("theme/test-project-2-shadcn-theme.validation.json")
const review = JSON.parse(fs.readFileSync(mappingPath, "utf8"))
if (review.status !== "approved") throw new Error("The shadcn mapping is not approved")

const rootOrder = [
  "radius", "background", "foreground", "card", "card-foreground", "popover",
  "popover-foreground", "primary", "primary-foreground", "secondary",
  "secondary-foreground", "muted", "muted-foreground", "accent",
  "accent-foreground", "destructive", "destructive-foreground", "border", "input", "ring",
]
for (const name of rootOrder) {
  if (!review.mapping[name]) throw new Error(`Missing mapping: ${name}`)
}

const customNames = Object.keys(review.preservedCustomTokens)
const colorNames = rootOrder.filter((name) => name !== "radius")
const themeLines = [...colorNames, ...customNames].map((name) => `  --color-${name}: var(--${name});`)
const rootLines = rootOrder.map((name) => {
  const item = review.mapping[name]
  return `  --${name}: ${item.value}; /* ${item.source} */`
})
const customLines = customNames.map((name) => {
  const item = review.preservedCustomTokens[name]
  return `  --${name}: ${item.value}; /* ${item.source} */`
})

const css = `/*
 * Generated from Test Project 2 Figma Variables, Orange mode.
 * The approved Figma pair primary / primary-foreground measures 3.17:1.
 * It is preserved by explicit designer decision and does not pass WCAG AA for normal text.
 * Blue, dark mode, charts, sidebar, and design elements are intentionally deferred.
 */

@theme inline {
${themeLines.join("\n")}

  --font-sans: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

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

  /* Preserved interaction and status roles from the Figma system. */
${customLines.join("\n")}
}
`

fs.mkdirSync(path.dirname(themePath), { recursive: true })
fs.writeFileSync(themePath, css)

const defined = new Set([...rootOrder, ...customNames])
const referenced = [...css.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((match) => match[1])
const unresolved = [...new Set(referenced.filter((name) => !defined.has(name)))]
const validation = {
  valid: unresolved.length === 0,
  generatedAt: "2026-10-02",
  sourceMode: review.sourceMode,
  rootTokenCount: rootOrder.length,
  preservedCustomTokenCount: customNames.length,
  unresolvedReferences: unresolved,
  approvedAccessibilityExceptions: [
    { pair: "primary / primary-foreground", ratio: 3.17, wcagAaNormalText: false },
  ],
  deferred: review.intentionalOmissions,
}
fs.writeFileSync(validationPath, `${JSON.stringify(validation, null, 2)}\n`)
if (!validation.valid) throw new Error(`Unresolved CSS references: ${unresolved.join(", ")}`)
console.log(JSON.stringify(validation, null, 2))
