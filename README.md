# Design System → shadcn Prototype Workflow

Reusable workflow for turning a project-specific Figma design system into a themed shadcn prototype.

This repository contains the first pilot using **Prototype UI Library**. Future projects can reuse the same process while replacing the Figma source, exported tokens, mappings, theme, and prototype content.

## Flow

```text
Figma Variables
  → raw export
  → DTCG bundles
  → semantic shadcn mapping
  → generated CSS theme
  → project-specific component adapters
  → clickable prototype
```

## Repository structure

- `project.config.json` — identifies the active Figma source and pilot scope.
- `tokens/raw/` — unchanged Figma Variable exports retained as evidence.
- `tokens/dtcg/` — portable, validated token bundles.
- `theme/` — generated shadcn theme and validation report.
- `mappings/` — token and component mapping artifacts.
- `scripts/` — repeatable conversion and validation scripts.
- `apps/prototype/` — interactive shadcn prototype for the active project.
- `docs/workflow/` — decisions, experiments, errors, and team instructions.

## New project workflow

1. Create a repository from this workflow or copy its structure.
2. Replace the Figma source values in `project.config.json`.
3. Ask Codex to export the new file's Variables through Figma MCP.
4. Regenerate DTCG, mappings, and theme CSS.
5. Build the requested prototype using only the components needed by its user story.
6. Review changes through GitHub before treating the generated theme as released.

shadcn is initialized once per repository. Designers who clone an existing project do not run the shadcn initialization again; they only install dependencies and use the committed components.

