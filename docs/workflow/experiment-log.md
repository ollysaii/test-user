# Experiment log

## Experiment 001 — Establish scope and export Figma Variables

Date: 2026-09-25

### Goal

Export Variables from the Figma file `Prototype UI Library` without changing the source file, then use the export to test a reusable Figma-to-shadcn workflow.

### Source

- Figma file key: `X6H2qWq3xat1CeUW3unUmK`
- Starting node: `3:413`
- Observed library areas: Foundations, Core, Design Elements, Sections

### Approved scope

- Variables
- Styles
- Base components such as buttons, inputs, toggles, switches, checkboxes, radio buttons, tabs, dropdowns, and badges

### Excluded scope

- Design Elements
- Sections

### Planned export procedure

1. Verify authenticated access to the Figma file.
2. Open the Variables view.
3. Export every relevant collection and mode.
4. Save the raw export unchanged.
5. Record collection names, mode names, token counts, aliases, and any export limitations.
6. Normalize a separate copy to DTCG only after the raw export is preserved.

### Status

Completed through the connected Figma MCP server. No browser authentication and no Figma mutation were required.

### Result

- Exported 5 local collections and 320 Variables.
- `Primitives`: 109 Variables — 44 COLOR, 60 FLOAT, 5 STRING.
- `Semantic`: 125 COLOR Variables; all 125 mode values are aliases.
- `Radius`: 20 FLOAT Variables across 3 responsive modes; 60 alias values.
- `Typography`: 32 FLOAT Variables across 3 responsive modes; 96 alias values.
- `Spacing`: 34 FLOAT Variables across 3 responsive modes; 102 alias values.
- Responsive modes observed: `1440`, `744`, and `375`.
- The raw exports include ids, keys, names, types, values per mode, aliases, descriptions, publication visibility, scopes, and code syntax.
- Files were saved under `work/workflow-lab/raw/figma-variables/`.

### Errors and lessons

- The initial public browser view showed the file structure but was not authenticated, so Variables were not yet accessible from that session.
- Lesson: distinguish public canvas visibility from authenticated Variables access before promising an export path.
- Only the Codex in-app browser was available; no already-authenticated Chrome, Edge, or native Figma surface was connected.
- Correction: browser authentication was unnecessary because the installed Figma MCP server already had authenticated file access.
- The first full-collection MCP response exceeded the safe response size and was truncated, producing invalid JSON at character 20,460.
- Recovery: export each collection in batches of 12 Variables, parse every batch, merge locally, and assert the final count against the inventory before saving.
- Lesson: for large Figma collections, never treat one large tool response as the canonical export; use bounded batches and verify counts.

## Experiment 002 — Normalize the raw export to DTCG

Date: 2026-09-25

### Goal

Create portable, standards-based token documents without changing the raw Figma export or renaming the design-system vocabulary.

### Method

1. Use DTCG 2025.10 token types and alias syntax.
2. Preserve Figma metadata in `$extensions`.
3. Generate one self-contained bundle per responsive mode: 1440, 744, and 375.
4. Include Primitives and Semantic Light in every bundle so aliases resolve within the same document.
5. Validate token count, type presence, dimensions, colors, and alias resolution.

### Result

- Generated 3 DTCG bundles with 320 tokens each.
- Each bundle contains 211 aliases and zero unresolved aliases.
- Structural validation passed for all bundles.
- Created an initial shadcn mapping proposal without modifying Figma.

### Errors and lessons

- The first validator incorrectly classified aliased dimension tokens as invalid because it accepted only literal `{ value, unit }` dimensions.
- Correction: a DTCG alias string is valid for a dimension token when it resolves to a dimension target.
- Lesson: validators must resolve or explicitly allow typed aliases; otherwise a strong alias architecture is falsely reported as broken.
- Four tracking tokens remain deliberately typed as `number`, not `dimension`, because the Figma Variable payload does not reveal whether their unit is percent, px, or em.

## Experiment 003 — Review the Figma-to-shadcn semantic mapping

Date: 2026-09-25

### Goal

Resolve the proposed shadcn aliases to exact exported values and create an approval artifact before generating CSS or changing Figma.

### Result

- Prepared 16 core shadcn mappings and 9 preserved custom state/status tokens.
- Resolved all mapped colors to exact hex values and the base radius to `6px`.
- Proposed code-only compatibility fallbacks for `card`, `card-foreground`, `popover`, and `popover-foreground` because the current Semantic collection has no dedicated tokens for them.
- Generated a static palette and a human-readable mapping review.
- No CSS was generated and no Figma data was mutated; the mapping is awaiting approval.

### Errors and lessons

- `Radius/Button/radius-btn-md` actually resolves to `primitives.radius.md` (`6px`), but its Figma description says `radius/lg`.
- Lesson: automation must resolve the alias graph and treat descriptions as documentation, not as the source of truth. Documentation drift should be reported separately.
- The Semantic collection has only a Light mode. A dark shadcn theme must not be invented during the initial migration.

## Experiment 004 — Generate and validate the shadcn theme

Date: 2026-09-25

### Goal

Turn the approved mapping into a reusable shadcn/Tailwind v4 theme fragment without changing the Figma source.

### Result

- Generated 20 core CSS Variables, including the approved white `card` and `popover` fallbacks.
- Exposed 9 preserved Figma component/status roles as additional Tailwind color tokens.
- Generated the current shadcn radius scale from the approved `6px` base radius.
- Validation found zero unresolved CSS Variable references.
- All 8 semantic surface/foreground pairs pass WCAG AA for normal text; measured contrast ranges from 5.64:1 to 17.85:1.
- Added a short integration guide for the receiving codebase.

### Intentional omissions

- No `.dark` theme was generated because Figma currently has no Dark semantic mode.
- Chart and Sidebar token families were not invented because they are outside the approved pilot scope.
- Component recipes were not patched because no receiving shadcn repository has been selected yet.

## Experiment 005 — Audit and map base components

Date: 2026-09-25

### Goal

Read the existing CORE component sets from Figma and propose behaviorally correct shadcn equivalents without mutating either side.

### Result

- Inspected Button, Link Button, Icon Button, Input, Search, Textarea, Tabs, Toggle, Switcher, Checkbox, Radio, Dropdown, Badge, and File Upload assets.
- Confirmed that most visual properties are already Variable-bound.
- Defined a mapping that distinguishes same-name components from same-behavior components.
- Proposed a single responsive code API instead of duplicating desktop and mobile components.
- Created a component mapping review and machine-readable proposal.

### Errors and lessons

- Code Connect inventory failed because it requires a Dev or Full seat on an Organization or Enterprise plan.
- Recovery: direct Figma MCP Plugin API inspection successfully returned local component sets, properties, variants, geometry, bindings, and nested instances.
- Lesson: Code Connect is optional for the workflow; document its plan requirement and keep a direct-inspection fallback.
- The first whole-file component inventory included more than 1,100 icon components and exceeded a useful response size.
- Recovery: exclude the Icons page, then inspect scoped component sets in bounded batches.
- Lesson: component audits require the same bounded-batch strategy as Variable exports.

## Workflow acceleration checkpoint

Date: 2026-09-25

- Component renaming was deliberately deferred and preserved as a future step.
- The pilot moved from exhaustive library parity to a vertical-slice prototype.
- Reusable work already completed: Figma Variables export, DTCG conversion, validation, shadcn theme, and initial component mapping.
- Next input required: one user story or hypothesis to turn into a minimal clickable prototype.

## Experiment 006 — Establish GitHub source control

Date: 2026-09-25

### Result

- Created the private repository `ollysaii/design-system-prototype-workflow`.
- Added the current Figma raw export, validated DTCG bundles, shadcn mapping, generated theme, scripts, project configuration, and workflow documentation.
- Added repository-level Codex instructions for future project-specific Figma sources.
- Established `main` as the reviewed/released state and kept Figma as the design-decision source.

### Reuse rule

New designers do not reuse the Prototype UI Library theme. They reuse the workflow structure, then provide their own Figma file so Codex can replace the project-specific tokens, mapping, CSS theme, and prototype.

## Experiment 007 — Build the first shadcn prototype

Date: 2026-09-25

### Goal

Prove that the generated Figma theme can style a real, clickable shadcn screen without changing or renaming the Figma source.

### Result

- Initialized the reusable prototype app in `apps/prototype/` with Vite, React, shadcn, Radix, and the Nova preset.
- Connected the generated project theme through `theme/prototype-ui-shadcn-theme.css`.
- Built an account-settings vertical slice using Button, Input, Select, Switch, and Checkbox.
- Kept `card` and `popover` light by mapping both to the existing white background semantic.
- Added validation, save confirmation, responsive layout, visible focus behavior, and mobile-friendly touch targets.
- Lint and production build both pass.
- Visual inspection of the running prototype passed.

### Errors and lessons

- The initializer could not scaffold into a pre-created empty directory. Recovery: verify that the directory is empty, remove only that empty directory, then let the official initializer create it.
- The generated Button module intentionally exports both the component and its variants, which triggered the repository's React Refresh lint rule. Recovery: add a narrow exception for that generated file instead of weakening lint globally.
- The restricted workspace blocked the local preview port. Recovery: request permission only for the local development server; no public deployment was required.
- Vite reported that `__dirname` will not be supported by a future native config loader. Recovery: move the alias configuration to `import.meta.dirname`; the warning is now resolved.
- The official initializer created its own nested `.git` directory, so the first outer commit treated the app as an embedded repository. Recovery: preserve the nested metadata in `work/recovery/`, remove the gitlink from the index, and commit the actual application files. Future automation must check for and remove nested repository metadata before staging a newly initialized app.
