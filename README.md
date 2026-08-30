# MobiDoc

[![Built with Bilt](https://img.shields.io/endpoint?url=https%3A%2F%2Fapp.bilt.me%2Fapi%2Fbadge)](https://bilt.me)

**An AI phone-repair assistant for Pakistan.** Describe what's wrong with your phone in English, Urdu, or Roman Urdu — or just photograph the damage — and MobiDoc tells you the likely cause, whether it's a safety hazard, what the repair typically costs in PKR in your city, and which nearby shops are worth going to.

No account. No login. History stays on the device.

---

## Why it exists

Pakistan has a repair shop on every street. What it doesn't have is a way for the customer to know what the fault is or what a fair price looks like before walking in. The user knows the symptom; the shop names the part and the price; there's no way to check either. The two failure modes are overpaying, and paying for a repair that wasn't needed at all.

MobiDoc closes that information gap at the counter.

## What it does

- **Diagnosis in your own language.** Type the problem in English, Urdu, or Roman Urdu. Gemini detects the language and answers in the same one. App chrome is fully translated (en / ur), and Urdu flips the layout to RTL instantly — no app restart.
- **Optional damage photo.** Attach a photo from the camera or gallery and the diagnosis becomes multimodal. When a photo is present the model also returns what it could see; with no photo, that section can't appear at all, so nothing is invented.
- **Safety before cost.** A swollen battery or liquid damage is flagged as a hazard, not priced cheerfully. Some issues (charging-port lint, software freezes) are marked self-fixable — the app declines to send you to a shop when you don't need one.
- **PKR cost range, never a single price.** Min–max for your city, split into parts vs labour, always labelled an estimate and not a quote.
- **Nearby shops with reasons.** Ranked from Google Places with a transparent client-side score — rating smoothed toward a prior, review volume, distance decay, open-now, and review-theme keywords. Every shop shows *why* it ranked where it did. Re-sorting by Recommended / Top rated / Nearest costs no network call.
- **WhatsApp handoff.** One tap sends the shop a ready-made message: device, the problem in the user's words, the reading, likely cause, expected repair time, a note when a photo is available, and the questions to ask. **The price is deliberately left out** — the user keeps their estimate as leverage and asks the shop to quote first.
- **Local history.** Past diagnoses persist in AsyncStorage. No backend account needed.
- **Demo mode.** An explicit toggle in Settings runs the entire app — diagnoses, shops, map, history, WhatsApp — on seeded data with no network and no GPS. A "Demo data" banner stays visible throughout, and sample data never silently replaces a failed live call.

## How it's built

```
problem text (+ optional photo)
        ↓
  diagnose  ──────────► Gemini, structured JSON output
        ↓
  PKR range for the detected city
        ↓
  nearby-shops  ──────► Google Places (searchText)
        ↓
  client-side ranking with reasons
        ↓
  WhatsApp message to the shop
```

**No API keys in the app bundle.** Gemini and Google Places are reached through three bilt-cloud edge functions. The phone never holds a key.

| Function | Does |
| --- | --- |
| `diagnose` | Gemini with a response schema → validated `Diagnosis` JSON. Model fallback chain, one retry on invalid output, replies in the detected input language, 14-day cache. |
| `nearby-shops` | Places `searchText` with radius widening (2 / 5 / 15 km), trimmed review excerpts, 30-minute cache. |
| `place-details` | Hours, phone (local + international), website, top reviews. Photos proxied so the key never leaves the server. |

Responses use a deliberate convention: handled failures return **HTTP 200 with `{ error: code }`** so the code survives to the client (the platform strips bodies on 5xx). `lib/api.ts` maps those codes to i18n error keys.

Server-side cache lives in `public.api_cache` with RLS on and no policies, so only the service key can read it.

## Tech stack

- **React Native** + **Expo** (SDK 54) with **Expo Router** — typed routes, React Compiler enabled
- **TypeScript** throughout
- **HeroUI Native** + **Uniwind** for UI and theming
- **Zustand** for state, **AsyncStorage** for persistence
- **TanStack Query** for async data
- **i18next** + **expo-localization** for en / ur, with a `useDirection` hook driving RTL
- **react-native-maps** on native, **pigeon-maps** on web (behind `components/MapView`)
- **@biltme/backend** for the edge-function client
- **Gemini** for diagnosis, **Google Places** for shops — both server-side only

## Project layout

```
app/                  Expo Router screens
  (tabs)/             Diagnose · Shops · History · Settings
  diagnosis/[id]      Result screen
  shop/[id]           Shop detail
components/           Shared UI (cards, banners, badges, MapView)
hooks/                useDirection, useAsyncStorage
lib/
  api.ts              Edge-function wrappers + error-code mapping
  recommendation.ts   Shop scoring and reason codes
  whatsapp.ts         Message builder + number classification
  photo.ts            Resize / compress before upload
  store/              Zustand stores (draft, result, history, settings, …)
  locales/            en.ts · ur.ts
  demo/seed.ts        Offline demo dataset
```

## Running locally

Requires Node.js ≥ 20.19.4.

```sh
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` for web.

The backend URL and anon key are injected by Bilt at runtime; `GEMINI_API_KEY` and `GOOGLE_PLACES_API_KEY` live in the edge functions' environment and are never needed by the app. If you're running against your own backend, deploy the three functions and set those two secrets there.

**Note on Expo Go:** the WhatsApp app-detection path needs the `whatsapp` URL scheme declared in `app.config.ts`, which only takes effect in a native build. In Expo Go the flow falls back to the `wa.me` web link.

### Checks

```sh
npm run lint          # oxlint, type-aware
npm run lint:css      # theme token check
npm run format        # oxfmt
```

## Roadmap

- **Quote checker** — enter the price the shop gave you, get "that's ~45% above the typical Lahore range for this repair."
- **Voice input in Urdu** — record instead of type; the accessibility case becomes the core one.
- **Guided self-fix** — step-by-step for the issues that don't need a shop.

Out of scope for v1: user accounts, community reviews, favourite shops, repair-request tracking.

## Editing this project

**With Bilt** — open the [project](https://app.bilt.me/agent/8350896f-776a-45a3-85d1-7da278152384) and describe the change in plain language.

**In your own IDE** — export the source from Bilt (or clone this repo), `npm install`, `npx expo start`.

**Deploying** — in Bilt, open **Deploy & Share** for a preview link, a web publish, or an App Store / Play Store release.

Project ID: `8350896f-776a-45a3-85d1-7da278152384`

## Help

- [Bilt Documentation](https://bilt.me/docs)
- [Discord](https://discord.gg/9Y8vpDAhbD)
- support@bilt.me
