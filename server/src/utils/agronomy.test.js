const test = require('node:test');
const assert = require('node:assert');
const { analyzeSoil, pestRisks } = require('./agronomy');

test('analyzeSoil rates optimal soil as good', () => {
  const r = analyzeSoil({ ph: 6.8, nitrogen: 400, phosphorus: 15, potassium: 200, organicCarbon: 0.6 });
  assert.strictEqual(r.rating, 'good');
  assert.strictEqual(r.advice.length, 0);
});

test('analyzeSoil flags acidic soil', () => {
  const r = analyzeSoil({ ph: 5.0 });
  assert.strictEqual(r.readings[0].level, 'low');
  assert.ok(r.advice[0].includes('lime'));
});

test('pestRisks warns about heavy rain', () => {
  const r = pestRisks({ temperature: 26, humidity: 50 }, [{ rain: 30 }, { rain: 20 }, { rain: 5 }]);
  assert.ok(r.some(x => x.severity === 'critical'));
});
