import fs from "node:fs"
import path from "node:path"

const rawDir = path.resolve("tokens/raw")
const outDir = path.resolve("tokens/dtcg")
const sourceNames = ["primitives", "semantic", "spacing", "radius"]
const sources = Object.fromEntries(
  sourceNames.map((name) => [name, JSON.parse(fs.readFileSync(path.join(rawDir, `${name}.raw.json`), "utf8"))]),
)

const selectedModes = { primitives: "Orange", semantic: "Orange", spacing: "Value", radius: "Value" }
const idToPath = new Map()
for (const [sourceName, source] of Object.entries(sources)) {
  for (const variable of source.variables) {
    idToPath.set(variable.id, `${sourceName}.${variable.name.split("/").join(".")}`)
  }
}

const modeId = (source, modeName) => {
  const mode = source.collection.modes.find((candidate) => candidate.name === modeName)
  if (!mode) throw new Error(`Mode ${modeName} missing from ${source.collection.name}`)
  return mode.modeId
}
const byte = (value) => Math.round(Math.max(0, Math.min(1, value)) * 255).toString(16).padStart(2, "0")
const toHex = ({ r, g, b, a = 1 }) => `#${byte(r)}${byte(g)}${byte(b)}${a < 1 ? byte(a) : ""}`.toUpperCase()
const tokenType = (variable) => variable.type === "COLOR" ? "color" : "dimension"
const tokenValue = (variable, value) => {
  if (value && typeof value === "object" && value.aliasTo) {
    const target = idToPath.get(value.aliasTo)
    if (!target) throw new Error(`Broken alias ${variable.name} -> ${value.aliasTo}`)
    return `{${target}}`
  }
  if (variable.type === "COLOR") {
    return { colorSpace: "srgb", components: [value.r, value.g, value.b], alpha: value.a ?? 1, hex: toHex(value) }
  }
  return { value, unit: "px" }
}

const document = {
  $description: "Test Project 2 tokens using the approved Orange brand mode.",
  $extensions: { "com.workflow": { source: "Figma MCP read-only export", fileKey: "46nPhujYaIS66Y0uJeCPit", primitiveMode: "Orange", semanticMode: "Orange", generatedFromRaw: true } },
}

let tokenCount = 0
let aliasCount = 0
for (const [sourceName, source] of Object.entries(sources)) {
  const selectedModeId = modeId(source, selectedModes[sourceName])
  for (const variable of source.variables) {
    const segments = [sourceName, ...variable.name.split("/")]
    let cursor = document
    for (const segment of segments.slice(0, -1)) {
      cursor[segment] ??= {}
      cursor = cursor[segment]
    }
    const rawValue = variable.valuesByMode[selectedModeId]
    if (rawValue === undefined) throw new Error(`Missing ${selectedModes[sourceName]} value for ${variable.name}`)
    if (rawValue && typeof rawValue === "object" && rawValue.aliasTo) aliasCount += 1
    cursor[segments.at(-1)] = {
      $type: tokenType(variable),
      $value: tokenValue(variable, rawValue),
      $extensions: { "com.figma": { id: variable.id, key: variable.key, scopes: variable.scopes, codeSyntax: variable.codeSyntax, hiddenFromPublishing: variable.hiddenFromPublishing } },
      ...(variable.description ? { $description: variable.description } : {}),
    }
    tokenCount += 1
  }
}

fs.mkdirSync(outDir, { recursive: true })
for (const existing of fs.readdirSync(outDir)) {
  if (existing.endsWith(".tokens.json")) fs.unlinkSync(path.join(outDir, existing))
}
const filename = "foundation.orange.tokens.json"
fs.writeFileSync(path.join(outDir, filename), `${JSON.stringify(document, null, 2)}\n`)
const audit = {
  specification: "DTCG 2025.10",
  sourceVariableCount: tokenCount,
  generatedBundles: [{ filename, tokenCount }],
  countsByCollection: Object.fromEntries(Object.entries(sources).map(([name, source]) => [name, source.variables.length])),
  selectedModes,
  aliasCount,
  brokenAliases: [],
  valid: tokenCount === 129 && aliasCount === 69,
}
fs.writeFileSync(path.join(outDir, "audit.json"), `${JSON.stringify(audit, null, 2)}\n`)
if (!audit.valid) throw new Error(`Unexpected export counts: ${JSON.stringify(audit)}`)
console.log(JSON.stringify(audit, null, 2))
