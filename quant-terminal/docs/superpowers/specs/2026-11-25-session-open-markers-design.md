# Session open markers — short design

## Intent / why
The user wants to see at a glance when the Sydney, Tokyo, London and New York
exchanges open, using each exchange's own local opening bell, with times shown on
the app's clock (UTC+3, already the computer's timezone).

## Goals
- Place four labelled arrows on intraday charts at the exchange opening bells:
  Sydney 10:00 local, Tokyo 09:00, London 08:00, New York 09:30.
- Daylight saving is handled for Sydney, London and New York; Tokyo has none.
- Marker label names the session and its local bell time, e.g. `London 08:00`.
- Switch the indicator on for the current chart and for charts opened later.

## Non-goals / anti-goals
- No change to the app's time display: the computer is UTC+03:00 (Nairobi, no DST)
  and `settings.utc` is false, so charts already show UTC+3.
- No markers on 1D/1W charts — there is no bar at an intraday bell time.
- No alerts and no new settings panel.

## Constraints
- Markers attach to bar times; a bell between bars must land on the bar that
  contains it (e.g. New York 09:30 on an hourly chart lands on the 09:00 bar).
- A custom indicator must return one output array as long as `bars`, even when
  only markers are wanted. Use one hidden dummy line of `NaN`.
- `Intl.DateTimeFormat` with IANA zones is available in the browser and Node 18+.

## Approaches
- **A (picked):** one custom indicator in `custom/`, enabled on saved and new
  panes. Fits the app's existing marker system; small, no core code paths beyond
  the new-pane default.
- B: a built-in indicator in `public/lib/indicators.js`. More code and tests, no
  benefit for a single user.
- C: chart-level overlay in `chart.js`. Most invasive; needs UI controls.

## How
1. `custom/session-opens.js`: export an indicator with `overlay: true`, one dummy
   output, and `calc(bars, p, ta)` returning `{ value, markers }`.
   - Four module-level `Intl.DateTimeFormat` objects for
     `Australia/Sydney`, `Asia/Tokyo`, `Europe/London`, `America/New_York`,
     with `hourCycle: 'h23'` and year/month/day/hour/minute parts.
   - For each bar, read local wall time at the bar start and at the next bar
     start (fall back to the previous step for the last bar). When a session's
     bell time falls inside that interval on that local date and has not been
     marked for that zone+date yet, add a marker at `bars[i].time`.
   - Marker: `{ time, position: 'aboveBar', shape: 'arrowUp', color, text }`
     with a distinct colour per session and text like `London 08:00`.
   - Dedupe with a `Set` keyed by `zone|localDate`.
2. Enable it: add `{ uid, id: 'custom:session-opens', params: {} }` to every pane
   in `data/state.json` (preserving all other saved state), then restart the app
   so it loads. Patch `setLayout()` in `public/js/app.js` so newly created panes
   include the same indicator.
3. Test `test/session-opens.test.js`: check markers on known UTC timestamps in
   winter and summer for all four zones, that no session is marked twice in a
   day, and that the indicator passes `registerIndicator` validation. Add the
   test to `scripts/check.js` and `package.json`.

## Left to the builder
- Exact colours and whether to use `aboveBar` for all four or alternate sides.
