import fs from "node:fs";
import path from "node:path";

const root = path.resolve("work/workflow-lab");
const rawDir = path.join(root, "raw/figma-variables");
const outDir = path.join(root, "derived/dtcg");

const read = (name) => JSON.parse(fs.readFileSync(path.join(rawDir, name), "utf8"));
const sources = {
  primitives: read("primitives.raw.json"),
  semantic: read("semantic.raw.json"),
  radius: read("radius.raw.json"),
  typography: read("typography.raw.json"),
  spacing: read("spacing.raw.json"),
};

const idToTokenPath = new Map();
for (const [collectionName, source] of Object.entries(sources)) {
  for (const variable of source.variables) {
    idToTokenPath.set(variable.id, `${collectionName}.${variable.name.split("/").join(".")}`);
  }
}

const audit = {
  specification: "DTCG 2025.10",
  sourceVariableCount: 0,
  generatedBundles: [],
  countsByCollection: {},
  aliasCount: 0,
  brokenAliases: [],
  invalidNames: [],
  caseInsensitiveCollisions: [],
  ambiguousUnits: [],
  notes: [],
};

const toHex = ({ r, g, b }) => {
  const byte = (value) => Math.round(Math.max(0, Math.min(1, value)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`;
};

const fontWeightMap = {
  Thin: 100,
  "Extra Light": 200,
  Light: 300,
  Regular: 400,
  Normal: 400,
  Medium: 500,
  SemiBold: 600,
  "Semi Bold": 600,
  Bold: 700,
  "Extra Bold": 800,
  Black: 900,
};

function tokenType(variable) {
  if (variable.resolvedType === "COLOR") return "color";
  if (variable.resolvedType === "BOOLEAN") return "boolean";
  if (variable.resolvedType === "STRING") {
    if (variable.name.startsWith("font/family/")) return "fontFamily";
    if (variable.name.startsWith("font/weight/")) return "fontWeight";
    return "string";
  }
  if (variable.resolvedType === "FLOAT") {
    if (variable.name.startsWith("font/tracking/")) return "number";
    return "dimension";
  }
  throw new Error(`Unsupported Figma type ${variable.resolvedType} for ${variable.name}`);
}

function literalValue(variable, value) {
  const type = tokenType(variable);
  if (type === "color") {
    return {
      colorSpace: "srgb",
      components: [value.r, value.g, value.b],
      alpha: value.a ?? 1,
      hex: toHex(value),
    };
  }
  if (type === "dimension") return { value, unit: "px" };
  if (type === "fontFamily") return [value];
  if (type === "fontWeight") return fontWeightMap[value] ?? value;
  return value;
}

function tokenFor(variable, modeId) {
  const sourceValue = variable.valuesByMode[modeId];
  if (sourceValue === undefined) throw new Error(`Missing mode ${modeId} for ${variable.name}`);

  let value;
  if (sourceValue && typeof sourceValue === "object" && sourceValue.type === "VARIABLE_ALIAS") {
    audit.aliasCount += 1;
    const target = idToTokenPath.get(sourceValue.id);
    if (!target) {
      audit.brokenAliases.push({ token: variable.name, modeId, targetId: sourceValue.id });
      value = `{unresolved.${sourceValue.id.replace(/[^a-zA-Z0-9_-]/g, "-")}}`;
    } else {
      value = `{${target}}`;
    }
  } else {
    value = literalValue(variable, sourceValue);
  }

  const token = {
    $type: tokenType(variable),
    $value: value,
    $extensions: {
      "com.figma": {
        id: variable.id,
        key: variable.key,
        collectionId: variable.variableCollectionId,
        scopes: variable.scopes,
        codeSyntax: variable.codeSyntax,
        hiddenFromPublishing: variable.hiddenFromPublishing,
      },
    },
  };
  if (variable.description) token.$description = variable.description;
  if (variable.name.startsWith("font/tracking/")) {
    token.$extensions["com.workflow-lab"] = {
      unitStatus: "unresolved",
      note: "Figma FLOAT Variables do not encode whether tracking is percent, px, or em.",
    };
  }
  return token;
}

function insertToken(rootObject, collectionName, variable, modeId) {
  const segments = [collectionName, ...variable.name.split("/")];
  let cursor = rootObject;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    cursor[segment] ??= {};
    cursor = cursor[segment];
  }
  cursor[segments.at(-1)] = tokenFor(variable, modeId);
}

function modeId(source, modeName) {
  const match = source.collection.modes.find((mode) => mode.name === modeName);
  if (!match) throw new Error(`Mode ${modeName} not found in ${source.collection.name}`);
  return match.modeId;
}

const allNames = [];
for (const [collectionName, source] of Object.entries(sources)) {
  audit.sourceVariableCount += source.variables.length;
  audit.countsByCollection[collectionName] = source.variables.length;
  for (const variable of source.variables) {
    const fullName = `${collectionName}/${variable.name}`;
    allNames.push(fullName);
    for (const segment of fullName.split("/")) {
      if (segment.startsWith("$") || /[{}.]/.test(segment)) audit.invalidNames.push(fullName);
    }
    if (variable.name.startsWith("font/tracking/")) audit.ambiguousUnits.push(fullName);
  }
}

const folded = new Map();
for (const name of allNames) {
  const key = name.toLocaleLowerCase();
  const previous = folded.get(key);
  if (previous && previous !== name) audit.caseInsensitiveCollisions.push([previous, name]);
  folded.set(key, name);
}

fs.mkdirSync(outDir, { recursive: true });

for (const breakpoint of ["1440", "744", "375"]) {
  const document = {
    $description: `Prototype UI Library tokens for the ${breakpoint}px responsive mode.`,
    $extensions: {
      "com.workflow-lab": {
        source: "Figma MCP read-only export",
        fileKey: "X6H2qWq3xat1CeUW3unUmK",
        semanticMode: "Light",
        responsiveMode: breakpoint,
        generatedFromRaw: true,
      },
    },
  };

  const selectedModes = {
    primitives: modeId(sources.primitives, "Value"),
    semantic: modeId(sources.semantic, "Light"),
    radius: modeId(sources.radius, breakpoint),
    typography: modeId(sources.typography, breakpoint),
    spacing: modeId(sources.spacing, breakpoint),
  };

  for (const [collectionName, source] of Object.entries(sources)) {
    for (const variable of source.variables) {
      insertToken(document, collectionName, variable, selectedModes[collectionName]);
    }
  }

  const filename = `foundation.light.${breakpoint}.tokens.json`;
  fs.writeFileSync(path.join(outDir, filename), `${JSON.stringify(document, null, 2)}\n`);
  audit.generatedBundles.push({ filename, tokenCount: audit.sourceVariableCount });
}

audit.notes.push("Each responsive bundle contains Primitives, Semantic Light, Radius, Typography, and Spacing so DTCG aliases resolve within one document.");
audit.notes.push("Figma collection and token names were preserved; no shadcn renaming has been applied.");
audit.notes.push("Tracking tokens remain number tokens because their unit cannot be inferred safely from the Figma Variable payload.");

fs.writeFileSync(path.join(root, "derived/dtcg-audit.json"), `${JSON.stringify(audit, null, 2)}\n`);

console.log(JSON.stringify(audit, null, 2));
