# Login and access recovery prototype — design specification

Date: 2026-10-02
Status: approved direction, awaiting written-spec review

## Objective

Extend the existing 375 × 812 px ОСЦПВ prototype with a passwordless login and access-recovery flow for returning customers. Preserve the current registration flow and reuse its phone, OTP, support, confirmation, theme, and destination components.

## Entry contexts

Demo controls expose login entry from an expired session, a policy deep link, an unfinished ОСЦПВ draft, a specific policy, an accident case, and a notification deep link. The selected `returnTo` value persists throughout login and determines the destination after successful OTP verification.

## Flow

- L0 explains why authentication is required without exposing whether an account exists. It offers login, safe return, and recovery when the phone is unavailable.
- L1 reuses the Ukrainian phone input with login-specific copy and `Отримати код` CTA. It supports incomplete-number and offline recovery states.
- L2 reuses the six-cell OTP input, masked phone, 30-second resend delay, wrong/expired/offline recovery, change-number action, and a direct path to access recovery.
- L3 briefly confirms `Ви увійшли`, then routes to the preserved `returnTo` destination.
- L4 explains that a manager must verify a number change. It offers manager contact, a callback-request form, return to the originating login screen, and unauthenticated accident help.

## Recovery extensions

- Callback request collects a callback phone number and a broad contact interval, then shows `Ми зв’яжемося з вами`.
- SMS-attempt-limit and unavailable-support states use recoverable bottom sheets without exposing security thresholds.
- An unavailable deep link routes to a full-screen information state with `До моїх полісів` and `Підтримка` actions.
- Temporary network errors preserve phone and OTP values.

## Shared behavior

Registration remains available from the guest start. Login never repeats profile creation or consent. Before OTP success, copy stays neutral and never reveals whether the entered phone belongs to an account. Accident help remains reachable without authentication.

## Mobile and accessibility

Keep the exact 375 × 812 px iOS review surface, visible back navigation, 44 px minimum touch targets, 48 px primary actions, numeric keyboards, visible focus, masked phone values, text error explanations, and screen-reader labels. Bottom sheets and back navigation preserve entered data.

## Verification

Verify lint and production build plus: successful policy deep-link return, saved-draft return, wrong OTP recovery, expired OTP resend, OTP network retry without data loss, recovery callback confirmation, accident help bypass, unavailable deep-link handling, and back navigation across L0–L4.

## Exclusions

No real SMS, backend, rate limiting, password reset, self-service phone-number change, PIN, biometrics, email, Diia, BankID, or document verification.
