import fs from "node:fs"
import path from "node:path"

const directory = path.resolve("tokens/dtcg")
const files = fs.readdirSync(directory).filter((name) => name.endsWith(".tokens.json"))
const reports = []

function walk(value, pathParts, tokens, aliases) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return
  if (Object.hasOwn(value, "$value")) {
    const tokenPath = pathParts.join(".")
    tokens.set(tokenPath, value)
    if (typeof value.$value === "string") {
      const match = value.$value.match(/^\{(.+)}$/)
      if (match) aliases.push({ tokenPath, targetPath: match[1] })
    }
    return
  }
  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith("$")) walk(child, [...pathParts, key], tokens, aliases)
  }
}

for (const filename of files) {
  const document = JSON.parse(fs.readFileSync(path.join(directory, filename), "utf8"))
  const tokens = new Map()
  const aliases = []
  walk(document, [], tokens, aliases)
  const unresolvedAliases = aliases.filter((alias) => !tokens.has(alias.targetPath))
  const missingTypes = [...tokens].filter(([, token]) => typeof token.$type !== "string").map(([name]) => name)
  const invalidDimensions = [...tokens]
    .filter(([, token]) => token.$type === "dimension" && typeof token.$value !== "string" && !(token.$value && typeof token.$value.value === "number" && token.$value.unit === "px"))
    .map(([name]) => name)
  const invalidColors = [...tokens]
    .filter(([, token]) => token.$type === "color" && typeof token.$value !== "string" && !(token.$value && token.$value.colorSpace === "srgb" && Array.isArray(token.$value.components) && token.$value.components.length === 3))
    .map(([name]) => name)
  reports.push({
    filename,
    tokenCount: tokens.size,
    aliasCount: aliases.length,
    unresolvedAliases,
    missingTypes,
    invalidDimensions,
    invalidColors,
    valid: unresolvedAliases.length === 0 && missingTypes.length === 0 && invalidDimensions.length === 0 && invalidColors.length === 0,
  })
}

const result = { valid: reports.length === 1 && reports.every((report) => report.valid), reports }
fs.writeFileSync(path.join(directory, "validation.json"), `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result, null, 2))
if (!result.valid) process.exitCode = 1
