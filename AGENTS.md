# Codex workflow instructions

This repository converts a project-specific Figma design system into a shadcn prototype.

## Start of every project

1. Read `project.config.json` and `docs/workflow/decision-log.md`.
2. Treat the configured Figma file as the design source and GitHub `main` as the latest released code/token state.
3. Use the official Figma MCP connection; do not ask the user to authenticate through an unrelated browser.
4. Preserve raw exports and transform copies only.

## Token synchronization

1. Export the configured Figma Variable collections in bounded batches.
2. Verify collection and Variable counts before replacing `tokens/raw/`.
3. Regenerate all responsive DTCG bundles in `tokens/dtcg/`.
4. Resolve aliases and stop on missing targets.
5. Regenerate `theme/prototype-ui-shadcn-theme.css` from the approved mapping.
6. Never invent dark, chart, sidebar, or component tokens that the source system does not provide.

## Prototypes

1. Reuse the committed shadcn installation in `apps/prototype/`; never initialize shadcn again inside an existing project.
2. Build only the components required by the supplied user story.
3. Preserve accessible semantics, keyboard behavior, visible focus, and 44 px touch targets.
4. Do not rename or mutate Figma components unless the user explicitly approves a rename manifest.
5. Record reusable errors and decisions under `docs/workflow/`.

## Git workflow

Use one branch per token update or prototype. Generated token/theme changes should be reviewable before merging into `main`.

