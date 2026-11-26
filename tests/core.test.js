import test from "node:test";
import assert from "node:assert/strict";
import { aqiBand, formatPollutant, sanitizeRecommendations, buildLocalPlan } from "../clearair-core.js";

test("AQI categories cover US AQI boundaries", () => {
  assert.equal(aqiBand(0)[0], "Good");
  assert.equal(aqiBand(50)[0], "Good");
  assert.equal(aqiBand(51)[0], "Moderate");
  assert.equal(aqiBand(101)[0], "Unhealthy for sensitive groups");
  assert.equal(aqiBand(151)[0], "Unhealthy");
  assert.equal(aqiBand(201)[0], "Very unhealthy");
  assert.equal(aqiBand(301)[0], "Hazardous");
  assert.equal(aqiBand(null)[0], "Unavailable");
});
test("pollutant formatting handles missing and invalid values", () => {
  assert.equal(formatPollutant(12.345), "12.3");
  assert.equal(formatPollutant(null), "—");
  assert.equal(formatPollutant("bad"), "—");
});
test("recommendation sanitizer limits count and field lengths", () => {
  const result = sanitizeRecommendations(Array.from({length:9}, () => ({title:"x".repeat(200),why:"y".repeat(600),impact:"z"})));
  assert.equal(result.length, 6);
  assert.equal(result[0].title.length, 120);
  assert.equal(result[0].why.length, 500);
});
test("local recommendations adapt to sensitive household and high AQI", () => {
  const result = buildLocalPlan({air:{us_aqi:180},household:"sensitive",budget:"low",commute:"transit"});
  assert.ok(result.some(x=>x.title.includes("family")));
  assert.ok(result.some(x=>x.title.includes("public-health")));
  assert.ok(result.every(x=>x.title&&x.why&&x.impact));
});
