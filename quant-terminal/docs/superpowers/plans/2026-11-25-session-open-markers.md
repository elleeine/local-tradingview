# Session Open Markers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put labelled arrows on intraday charts at the Sydney, Tokyo, London and New York exchange opening bells, in each exchange's local time with daylight saving handled.

**Architecture:** One custom indicator in `custom/` computes markers from bar times using IANA timezone formatters. It is enabled in the saved pane state and added to newly created panes. No server changes.

**Tech Stack:** Browser/Node ES modules, `Intl.DateTimeFormat`, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-25-session-open-markers-design.md`

## Global Constraints
- Node 18+, no build step, no new dependencies, no API keys.
- Chart times already display UTC+3; do not change the app's clock or `settings.utc`.
- Custom indicators must return one output array per `bars` entry and pass `registerIndicator` validation.
- Markers must pass validation: finite `time`, `position` in `aboveBar|belowBar|inBar`, `shape` in `arrowUp|arrowDown|circle|square`.
- Use `node scripts/...`, never `npm run ...`.

## Review Focus
- Bell falls between bars (New York 09:30 on an hourly chart) → marker lands on the bar containing it; test with 30m bars.
- Daylight saving changes the UTC instant → winter and summer expected times both tested.
- Two sessions at the same instant (Tokyo and Sydney in summer) → both markers kept.
- A weekly/daily bar spanning a whole day must not produce a marker → require same local date at both bar ends; test with a 1D bar.
- Newly opened charts must also show the markers → `setLayout()` default includes the indicator; verify by reading and `node --check`.

---

### Task 1: Custom indicator and its tests

**Files:**
- Create: `custom/session-opens.js`
- Test: `test/session-opens.test.js`
- Modify: `scripts/check.js` (test list), `package.json` (test script)

**Interfaces:**
- Consumes: `registerIndicator` from `public/lib/indicators.js`.
- Produces: default-export indicator object with `name`, `overlay`, `outputs`, `calc(bars, p, ta)`; id is `custom:session-opens`.

- [ ] **Step 1: Write the failing test** in `test/session-opens.test.js`. Import the indicator from `../custom/session-opens.js`. Build 15-minute bars with a helper covering `2026-01-14T22:00:00Z` to `2026-01-15T16:00:00Z` and assert `calc(bars, {}, {}).markers` contains exactly one marker each with text `Sydney 10:00`, `Tokyo 09:00`, `London 08:00`, `New York 09:30` at UTC times `2026-01-14T23:00:00Z`, `2026-01-15T00:00:00Z`, `2026-01-15T08:00:00Z`, `2026-01-15T14:30:00Z`. Add a summer test over `2026-07-15T22:00:00Z`–`2026-07-16T16:00:00Z` expecting Sydney `2026-07-15T00:00:00Z`, Tokyo `2026-07-15T00:00:00Z`, London `2026-07-15T07:00:00Z`, New York `2026-07-15T13:30:00Z`. Add a test that `registerIndicator({ ...ind, id: 'custom:session-opens' })` does not throw, and a test that one 1D bar spanning 24 hours produces no markers.

- [ ] **Step 2: Run it and confirm it fails** with module-not-found.

Run: `node --test test/session-opens.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Create `custom/session-opens.js`.** Export an indicator with `name: "Session opens (Sydney, Tokyo, London, New York)"`, `overlay: true`, and one output `{ key: 'value', label: 'Session opens', kind: 'line', color: '#90a4ae' }`. Create four module-level `Intl.DateTimeFormat` objects (`en-GB`, `hourCycle: 'h23'`, parts: year/month/day/hour/minute) for zones `Australia/Sydney`, `Asia/Tokyo`, `Europe/London`, `America/New_York`, with bell minutes 600, 540, 480, 570 and labels `Sydney`, `Tokyo`, `London`, `New York`. In `calc`, for each bar compute local parts at `bars[i].time` and at `bars[i+1].time` (for the last bar, use the previous step or 3600 seconds). When both ends share the same local date and the bell minute lies in `[startMin, endMin)`, push `{ time: bars[i].time, position: 'aboveBar', shape: 'arrowUp', color, text: '<Label> <HH:MM local>' }`, deduped by `zone|localDate`. Return `{ value: bars.map(() => NaN), markers }`.

- [ ] **Step 4: Run the test and confirm it passes.**

Run: `node --test test/session-opens.test.js`
Expected: PASS.

- [ ] **Step 5: Add `session-opens` to the test arrays** in `scripts/check.js` and `package.json`.

- [ ] **Step 6: Commit.**

```bash
git add custom/session-opens.js test/session-opens.test.js scripts/check.js package.json
git commit -m "feat: session open markers custom indicator"
```

### Task 2: Enable on saved and new charts

**Files:**
- Modify: `data/state.json` (local saved state, gitignored)
- Modify: `public/js/app.js` (`setLayout()` around lines 185–190)

**Interfaces:**
- Consumes: indicator id `custom:session-opens` from Task 1.
- Produces: no new exports; every pane carries an entry `{ uid, id: 'custom:session-opens', params: {} }`.

- [ ] **Step 1: Add the indicator to every pane** in `data/state.json` without changing any other saved value. Use a unique `uid` string per pane.

- [ ] **Step 2: Add the same entry to new panes** in `setLayout()` in `public/js/app.js`, inside the `indicators: []` default for newly created panes. Add the import of `newUid` is already present in this file; use it.

- [ ] **Step 3: Verify syntax and restart the app.** Run `node --check public/js/app.js` and `node -e "JSON.parse(require('fs').readFileSync('data/state.json','utf8')); console.log('state ok')"`. Then run `node scripts/stop.js` and `node scripts/launch.js` from `quant-terminal/`.

- [ ] **Step 4: Run the full check.** Run `node scripts/check.js`. Expected: `PASS Offline tests`, `PASS Data sources`, `PASS Live smoke test`, `READY`.

- [ ] **Step 5: Browser check.** Refresh `http://localhost:3777`, switch the chart to `4h` or `1h`, open the Indicators picker and confirm "Session opens (Sydney, Tokyo, London, New York)" is present and enabled, with labelled arrows on intraday bars.

- [ ] **Step 6: Commit.** `git add public/js/app.js && git commit -m "feat: enable session markers on all charts"` (the post-commit hook pushes it).
