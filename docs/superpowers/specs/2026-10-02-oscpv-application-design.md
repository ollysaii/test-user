# ОСЦПВ application wizard — design specification

Date: 2026-10-02
Status: approved direction, awaiting written-spec review

## Objective

Extend the existing 375 × 812 px ОСЦПВ prototype with one six-step application wizard for an authenticated customer. The wizard covers start date, vehicle discovery or manual entry, policyholder details, a transparent offer, document upload, draft persistence, and submission to the next review flow.

## Architecture

Keep the current React state-machine prototype and add a dedicated `application` screen with a numeric step plus focused substates. Reuse the existing Orange theme, Button, sheets, support actions, Home destination, and accessible mobile shell. Wizard data persists in component state across back navigation, editing, error recovery, and draft exit.

## Steps

1. Start: explain the process, select an available policy start date, create the draft.
2. Vehicle search: uppercase registration plate, search loading, found, not-found, and unavailable states with a permanent manual fallback.
3. Vehicle data: confirm automatically found values or edit/enter plate, make, model, year, vehicle type, and registration city.
4. Policyholder: prefilled editable profile fields, read-only account phone, owner toggle, local validation, and privacy explanation.
5. Offer: show price, coverage period, vehicle, masked policyholder details, included coverage, edit actions, and the effect of changed data.
6. Documents: add via camera or files, upload state, preview, replace, delete confirmation, invalid-file recovery, draft exit, and submission confirmation.

## Navigation and drafts

Every wizard state exposes back navigation, `Крок N із 6`, a label, help, and an exit action. Completed data is never cleared by back navigation or temporary failures. Exit explains that the draft is saved and offers save-and-exit, continue, or delete. Home shows a draft card that resumes at the last incomplete step.

## Deterministic demo behavior

- Plate `AA1234BB` returns a found Toyota Corolla.
- Plate `AA0000AA` returns not found.
- Plate `AA9999AA` simulates registry unavailability.
- Manual entry always remains available.
- Camera action can demonstrate denied/unclear capture; file selection succeeds.
- Submission is enabled only after the required vehicle document is added.
- Demo controls expose the main lookup and upload error states without changing production-facing copy.

## Mobile and accessibility

Keep the exact 375 × 812 px iOS review surface. Use 44 px minimum touch targets, 48 px primary actions, visible labels, appropriate keyboards, text error explanations, accessible progress announcements, and scroll-safe content with reachable CTAs. Sheets preserve underlying data.

## Verification

Verify lint and production build plus: found-vehicle happy path, manual entry, not-found recovery, registry failure recovery, policyholder email validation, offer editing return, successful file upload, camera fallback, document preview/replacement/deletion, save-and-resume draft, exit confirmation, and successful submission.

## Exclusions

No real registry, pricing engine, camera, file picker, upload, backend persistence, payment, policy issuance, underwriting workspace, or legal document validation.
