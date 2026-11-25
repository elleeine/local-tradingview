import { test } from "node:test";
import assert from "node:assert/strict";
import { DrawingLayer, constrain45, snapToOHLC } from "../public/js/drawings.js";

const close = (a, b) => Math.abs(a - b) < 1e-9;

test("Shift locks a line to the nearest 45° step and keeps its length", () => {
  const a = { x: 100, y: 100 };
  const flat = constrain45(a, { x: 200, y: 108 });
  assert.equal(flat.axis, "h");
  assert.ok(close(flat.y, 100));
  const up = constrain45(a, { x: 104, y: 20 });
  assert.equal(up.axis, "v");
  assert.ok(close(up.x, 100));
  const diag = constrain45(a, { x: 160, y: 50 });
  assert.equal(diag.axis, null);
  assert.ok(close(diag.x - 100, 100 - diag.y));
  assert.ok(close(Math.hypot(diag.x - 100, diag.y - 100), Math.hypot(60, 50)));
  assert.equal(constrain45(a, { x: 20, y: 103 }).axis, "h");
  assert.deepEqual(constrain45(a, a), { x: 100, y: 100, axis: null });
});

test("Ctrl snaps to the bar's nearest open, high, low or close", () => {
  const bar = { open: 10, high: 15, low: 8, close: 12 };
  assert.equal(snapToOHLC(bar, 14.2), 15);
  assert.equal(snapToOHLC(bar, 8.9), 8);
  assert.equal(snapToOHLC(bar, 11.3), 12);
  assert.equal(snapToOHLC(bar, 9.9), 10);
});

test("A drawing's points can be grabbed by their handles", () => {
  const layer = new DrawingLayer({ timeToX: (t) => t });
  layer.attached({ series: { priceToCoordinate: (p) => p }, requestUpdate() {} });
  const d = { type: "trend", points: [{ time: 10, price: 10 }, { time: 50, price: 90 }] };
  layer.setItems([d]);
  assert.equal(layer.handleAt(d, 12, 13), 0);
  assert.equal(layer.handleAt(d, 48, 88), 1);
  assert.equal(layer.handleAt(d, 30, 50), -1);
  assert.equal(layer.hitTest(30, 50), d);
});
