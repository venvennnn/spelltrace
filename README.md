# Spelltrace

Athlete-first personal bowling review for adult women pace bowlers.

**Core question:** What changed for me today, compared with my own usual bowling under similar conditions?

Spelltrace detects deviations from an athlete’s own earlier comparable sessions. It does not diagnose injury, assign a medical risk percentage, infer cycle phase, or prescribe a spell cap. Daily watch exports are never labelled as bowling-motion data.

The public website is **Spelltrace**. Demo mode ships with a clearly labelled synthetic athlete (Asha) — five prior side-on nets sessions plus one changed session — not athlete validation.

## What’s in this repo

| Path | Role |
| --- | --- |
| `packages/shared` | Design tokens, copy, Zod contracts, baseline/anomaly math, CSV preview, Gemini validation, demo seed, in-memory store |
| `apps/web` | Next.js App Router website (mobile-first, 360px → desktop) |
| `apps/mobile` | Expo iOS/Android app on the same account/API contracts |
| `apps/worker` | FastAPI worker for pose jobs and server-side Gemini checks |
| `supabase/migrations` | Postgres + RLS for a real athlete path |
| `templates/` | `daily_watch.csv` and `motion_samples.csv` |

## Local commands

```bash
npm install
npm test                          # shared acceptance + web contract tests
npm run dev                       # Spelltrace website at http://localhost:3000
# in another terminal, after the site is up:
npm run test:e2e --workspace=@spelltrace/web
```

Optional worker:

```bash
cd apps/worker
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8088
pytest
```

Expo (development build required for HealthKit / Health Connect — not Expo Go):

```bash
npm run dev:mobile
# or
npx expo start --workspace=@spelltrace/mobile
```

Copy `.env.example` to `.env.local`. Keep `GEMINI_API_KEY` on the server only.

## Working routes (Milestone A demo)

- `/` landing
- `/onboarding` filming + privacy
- `/today` My day / My bowling / What changed
- `/sessions` history
- `/sessions/new` create session + upload
- `/sessions/sess-changed-2026-10-02/review` usual vs changed + overlay + AI explanation
- `/compare` multi-clip comparison
- `/trends` ball / day / month
- `/watch` connection cards (live vs coming soon)
- `/shares/new` multi-select share + revoke
- `/s/:token` coach link (selected fields only)

## Remaining stubs

- **HealthKit / Health Connect:** interfaces and permission copy are in place. Live read/sync needs an Expo development build with entitlements.
- **Garmin / Google Health:** cards show **Coming soon**. Authorize endpoints return `provider_unavailable`. Fitbit Web API is not used.
- **MediaPipe on real video:** worker accepts jobs; consented clips are processed when the task model is pinned. Demo sessions use synthetic landmark traces.
- **Supabase Auth/Storage:** schema + RLS migration is ready; the running demo uses the in-memory store so `npm run dev` works without credentials.
- **Weather API, multilingual UI, ball tracking:** out of MVP as specified.

## Analysis defaults (not clinical cutoffs)

- Comparator: same athlete, arm, camera view, drill, effort; earlier sessions only
- Confident labels: ≥3 prior matched sessions and ≥30 quality-passed deliveries
- At most three pose findings; no opaque injury score
- Usual clip = medoid of the matched set, not the flattering one
- Watch motion anomalies require a real IMU file — never inferred from steps/HR/sleep

## Acceptance tests

`packages/shared/tests/acceptance.test.ts` covers the spec checks that are deterministic without a device: pose-without-watch, no fabricated IMU, baseline gate, comparator matching, share privacy/revoke/1–3–20 items, CSV rejection, demo provenance, movement-only trends, purge-from-trends, provider gating, overlay mapping, Gemini validation.

## Product limits (shown in UI)

Spelltrace does not diagnose injury. Optional menstrual notes stay private by default. A revoked link cannot retract a file already downloaded. Pixels cannot be reconstructed after video deletion.
