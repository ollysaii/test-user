# Decision log

## D-001 — Scope the first workflow to foundations and base components

Status: approved

Include Variables, Styles, and base UI components. Exclude Design Elements and Sections from the first workflow.

## D-002 — Preserve Figma naming and use a mapping layer

Status: approved direction

Do not rename every Figma token to match shadcn. Keep the design-system vocabulary and maintain an explicit Figma-to-shadcn mapping. Add custom shadcn tokens when the Figma system is richer than the default shadcn theme.

## D-003 — Start with one-way synchronization

Status: recommended for the experiment

Use `Figma → raw export → normalized DTCG → shadcn theme/code`. Defer bidirectional synchronization until naming, modes, aliases, and component contracts have been verified.

## D-004 — Preserve raw evidence

Status: approved direction

Never edit the original exported token files. Transform copies into normalized DTCG and generated code so results remain reproducible and auditable.

## D-005 — Use Figma MCP as the primary Figma access path

Status: approved by correction

When the official Figma MCP server is connected in Codex, use it directly for file inspection, Variables export, and future approved changes. Do not fall back to browser automation unless the MCP capability is unavailable or demonstrably insufficient.

## D-006 — Batch large MCP exports

Status: verified

Export large Variable collections in bounded batches and assert the merged count against the initial collection inventory. A successful tool call without count verification is not sufficient proof of a complete export.

## D-007 — Use resolved aliases as the technical source of truth

Status: approved by mapping confirmation

When a Variable description conflicts with its actual alias target, generate from the alias target, flag the documentation drift, and do not silently rewrite the Figma source.

## D-008 — Keep shadcn compatibility aliases outside Figma during the pilot

Status: approved

For required shadcn tokens that have no dedicated Figma semantic equivalent (`card` and `popover` families), point code aliases to the nearest existing semantic tokens. Do not expand the Figma taxonomy until real product usage proves that distinct semantics are needed.

## D-009 — Generate a Light-only shadcn theme first

Status: approved and verified

Generate only the theme represented by the current Figma Semantic Light mode. Preserve existing chart and sidebar tokens in a receiving project, and defer a `.dark` override until a dark semantic mode is designed and approved in Figma.

## D-010 — Defer Figma component renaming

Status: approved

Keep the current Figma component and variant names during the pilot. Preserve the proposed platform-neutral naming convention as a future cleanup phase after the workflow proves useful.

## D-011 — Switch the experiment to a vertical-slice MVP

Status: approved direction

Stop expanding the full-library audit. Test one real user scenario using the approved Light theme and only the shadcn components needed by that scenario. Treat full parity, GitHub integration, Code Connect, bidirectional sync, and Figma renaming as later phases.

## D-012 — Use GitHub as the released workflow and project artifact source

Status: approved and applied

Each project may use a different Figma design system. The reusable asset is the workflow, not one universal theme. For a new project, replace `project.config.json`, token exports, mappings, generated theme, and prototype content while preserving the shared repository structure and automation.

Figma remains the source of design decisions. GitHub `main` represents the latest reviewed and released token, theme, component, and prototype state. Designers reuse the committed shadcn installation instead of initializing shadcn again.

## D-013 — Use one repository per project design system

Status: approved direction

Keep the reusable workflow as a template, then create a separate repository for each project-specific Figma design system. Designers working on the same project share that project repository. Token updates are prepared on branches and reviewed through pull requests before changing that project's `main`; they do not overwrite the reusable template or another project's theme.

## D-014 — Standardize the prototype runtime

Status: verified in the pilot

Use the committed Vite, React, shadcn, Radix, and Nova setup under `apps/prototype/`. Future prototype tasks reuse it and replace only project-specific tokens, mappings, theme, and screens. Do not initialize shadcn again inside an existing project repository.

## D-015 — Preserve Test Project 2 brand modes pending approval

Status: approved for initial prototype

The source Primitives collection contains `Orange` and `Blue`, while the Semantic collection contains one mode named `Orange` whose values alias Primitives. Preserve both raw primitive modes, but generate only the `Orange` code theme for the initial prototype. Blue remains intentionally deferred and must not be deleted from the raw export.

## D-016 — Preserve the approved Figma primary foreground

Status: approved with known accessibility exception

Map `primary-foreground` to the existing `Brand/Text/text-on-brand` white value. The resulting white-on-orange pair measures `3.17:1` and does not meet WCAG AA for normal text. Preserve it to maintain Figma parity, record it in theme validation, and do not silently substitute a darker label in code.

## D-017 — Extend one prototype instead of duplicating authentication flows

Status: approved

Keep registration and returning-customer login in the same 375 × 812 px prototype. Reuse phone, OTP, support, confirmation, and destination components while keeping registration-only consent separate. Drive protected-entry and recovery scenarios from Demo controls.
