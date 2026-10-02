# ОСЦПВ registration prototype — design specification

Date: 2026-10-02
Status: approved conversational design, awaiting written-spec review

## Objective

Build a mobile-first clickable React prototype for account discovery or creation using a Ukrainian phone number and six-digit SMS OTP. The prototype must demonstrate successful registration, existing-user login, recovery from visible errors, consent for new users, and return to the user's original intent. It does not connect to SMS or a backend.

## Visual system

- Reuse the committed shadcn/Radix application and Test Project 2 Orange theme.
- Use `SF Pro Display` through the configured native system-font stack.
- Preserve the approved white-on-Orange primary-button treatment, including its documented `3.17:1` contrast exception.
- Use light page, card, sheet, and popover surfaces from the mapped Figma semantics.
- Minimum touch target: 44×44 px; primary CTA height: at least 48 px.

## Architecture

Implement one client-side state machine inside the existing Vite/React application. No router or backend is required. Each screen is a focused component and receives state plus event callbacks from the flow controller.

State retained across back navigation:

- launch intent: default, policy purchase, or accident help;
- phone digits and formatted display value;
- OTP digits and timer/resend state;
- new or existing account classification;
- required and optional consents;
- active bottom sheet and recoverable network-error state.

The state machine must prevent impossible transitions, including continuing with an incomplete phone number, verifying an incomplete OTP, or creating a new profile without required consent.

## Demo contract

The following deterministic inputs drive the prototype:

| Input | Result |
|---|---|
| Phone `67 123 45 42` | New customer; valid OTP continues to consent |
| Phone `67 123 45 11` | Existing customer; valid OTP skips consent |
| OTP `123456` | Successful verification |
| OTP `000000` | Incorrect-code state; cells clear and focus returns |
| OTP `999999` | Expired-code state with resend action |

A compact demo panel may toggle a network failure for the next phone, OTP, or profile request. It is visibly separated from the product UI and can be collapsed so usability testing can ignore it.

## Screens and transitions

### S0 — Guest start

- Product mark, headline, supporting copy, full-width account CTA, accident-help action, and legal links.
- Main CTA opens S1 with default intent.
- Accident help opens an unauthenticated emergency-help surface. An optional sign-in action from that surface starts S1 with accident intent.
- Legal links open a bottom sheet and return without losing state.

### S1 — Phone number

- Back navigation, `1 з 2`, explanatory copy, fixed `+380` prefix, nine-digit masked input, legal copy, help action, and sticky primary CTA.
- Numeric input and visible label are required.
- CTA is disabled until nine digits are present.
- Invalid state uses text plus an error border; editing clears it.
- Network failure shows a non-blocking banner with retry and retains the phone number.
- Successful submit briefly shows loading, then opens S2.

### S2 — OTP verification

- Back navigation retains the phone number.
- Display a masked number and one logical numeric input rendered as six visible cells.
- Filling the sixth digit automatically starts verification.
- Show a 30-second resend countdown with tabular numbers; resend resets OTP and timer.
- `000000` produces E04 and clears the input.
- `999999` produces E05 and enables immediate resend.
- Network failure preserves the six digits and exposes retry.
- `123456` routes existing customers to confirmation and new customers to S3.

### S3 — New-customer consent

- Required legal consent and optional marketing consent, with the optional choice off by default.
- Entire checkbox row is clickable; nested legal links open sheets without toggling the checkbox.
- CTA remains disabled until required consent is selected.
- Profile network failure preserves both choices and offers retry.
- Success opens a short confirmation state, then the correct S4 destination.

### S4 — Destination

- Default intent: Home with `Оформити ОСЦПВ`, `Мої поліси`, and `Допомога при ДТП`.
- Purchase intent: saved-draft/unfinished policy-purchase screen.
- Accident intent: accident-help screen or current-policy choice.
- New customers see `Номер підтверджено`; existing customers see `Ви увійшли` before destination content appears.

## Sheets and support

Use accessible modal bottom sheets for Terms, Privacy, and Support. Support exposes call and chat placeholders, plus an unavailable state with `Залишити заявку`. Closing a sheet restores focus and never resets entered data.

## Error and recovery behavior

- All errors explain the next action without blaming the user.
- Phone errors clear when the number is corrected.
- Incorrect OTP clears only OTP; phone and intent remain.
- Expired OTP cannot verify and exposes resend.
- Network failures never erase valid phone, OTP, or consent data.
- Accident support remains accessible without authentication.
- Error banners use an assertive live region where interruption is appropriate; inline help uses linked descriptions.

## Responsive and accessibility behavior

- Use an exact 375 × 812 px iOS application surface for review.
- At a 375 px browser width, render edge-to-edge without an outer card, desktop padding, shadow, or rounded device frame.
- On larger screens, center the same 375 × 812 px application surface without widening or converting it into a desktop form.
- Destination screens include a visible back action: purchase and accident return to Home; Home returns to the guest start screen.
- Use `inputMode="numeric"`, appropriate autocomplete attributes, logical labels, visible focus, and sequential focus order.
- Keep CTA reachable through sticky placement or scroll-safe spacing.
- OTP is one accessible input even though six cells are visible.
- Do not communicate errors through color alone.

## Components

Reuse or extend the committed shadcn primitives:

- Button and Checkbox;
- Input as the base for the phone input;
- new local components for AppShell, TopBar, StepIndicator, PhoneInput, OtpInput, TopBanner, BottomSheet, LoadingSpinner, ConfirmationState, DemoPanel, and destination cards.

Components remain presentation-focused; transition logic lives in the registration flow controller.

## Verification

Automated and manual checks must cover:

- lint, TypeScript, and production build;
- new-customer happy path;
- existing-customer branch without consent;
- incomplete/invalid phone recovery;
- wrong OTP recovery;
- expired OTP and resend reset;
- network retry without data loss on S1, S2, and S3;
- legal and support sheets preserving state;
- back navigation preserving phone and consent state;
- default, purchase, and accident destinations;
- keyboard focus, accessible labels, live error announcements, and minimum touch targets;
- mobile viewport visual inspection.

## Intentional exclusions

- Real SMS, backend, analytics, rate limiting, biometric/PIN login, email, Diia, BankID, document identity verification, and full insurance-purchase implementation.
