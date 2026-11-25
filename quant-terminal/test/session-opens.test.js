import { test } from 'node:test';
import assert from 'node:assert/strict';
import indicator from '../custom/session-opens.js';
import { registerIndicator } from '../public/lib/indicators.js';

const barsFrom = (start, end, step = 900) => {
  const bars = [];
  for (let t = Date.parse(start) / 1000; t <= Date.parse(end) / 1000; t += step)
    bars.push({ time: t, open: 1, high: 2, low: 0, close: 1, volume: 1 });
  return bars;
};
const at = (iso) => Date.parse(iso) / 1000;
const texts = (bars) => indicator.calc(bars, {}, {}).markers.map((m) => `${m.text}@${m.time}`);

test('winter exchange bells are marked at the right UTC bar times', () => {
  const got = texts(barsFrom('2026-01-14T22:00:00Z', '2026-01-15T16:00:00Z'));
  assert.ok(got.includes(`Sydney 10:00@${at('2026-01-14T23:00:00Z')}`));
  assert.ok(got.includes(`Tokyo 09:00@${at('2026-01-15T00:00:00Z')}`));
  assert.ok(got.includes(`London 08:00@${at('2026-01-15T08:00:00Z')}`));
  assert.ok(got.includes(`New York 09:30@${at('2026-01-15T14:30:00Z')}`));
});

test('summer exchange bells use daylight saving and both 00:00Z sessions appear', () => {
  const got = texts(barsFrom('2026-07-14T22:00:00Z', '2026-07-15T16:00:00Z'));
  assert.ok(got.includes(`Sydney 10:00@${at('2026-07-15T00:00:00Z')}`));
  assert.ok(got.includes(`Tokyo 09:00@${at('2026-07-15T00:00:00Z')}`));
  assert.ok(got.includes(`London 08:00@${at('2026-07-15T07:00:00Z')}`));
  assert.ok(got.includes(`New York 09:30@${at('2026-07-15T13:30:00Z')}`));
});

test('each session is marked once per local day', () => {
  const bars = barsFrom('2026-01-14T22:00:00Z', '2026-01-16T20:00:00Z');
  const markers = indicator.calc(bars, {}, {}).markers;
  for (const name of ['Sydney', 'Tokyo', 'London', 'New York'])
    assert.equal(markers.filter((m) => m.text.startsWith(name)).length, 2, `${name} count`);
});

test('a daily bar spanning a whole day is not marked', () => {
  const bars = barsFrom('2026-01-15T00:00:00Z', '2026-01-16T00:00:00Z', 86400);
  assert.equal(indicator.calc(bars, {}, {}).markers.length, 0);
});

test('the indicator passes the app validator', () => {
  assert.doesNotThrow(() => registerIndicator({ ...indicator, id: 'custom:session-opens' }));
});
