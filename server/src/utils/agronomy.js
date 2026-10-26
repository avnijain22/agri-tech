// Pure functions: soil health scoring and weather-based pest risk. Easy to unit-test.

const RANGES = {
  ph:            { low: 6.0, high: 7.5, label: 'pH' },
  nitrogen:      { low: 280, high: 560, label: 'Nitrogen (kg/ha)' },
  phosphorus:    { low: 10,  high: 25,  label: 'Phosphorus (kg/ha)' },
  potassium:     { low: 110, high: 280, label: 'Potassium (kg/ha)' },
  organicCarbon: { low: 0.5, high: 0.75, label: 'Organic carbon (%)' }
};

const ADVICE = {
  ph: { low: 'Soil is acidic: apply agricultural lime and organic compost.', high: 'Soil is alkaline: add gypsum or sulphur and organic matter.' },
  nitrogen: { low: 'Low nitrogen: apply urea or well-rotted FYM, or grow a legume.', high: 'Nitrogen is high: skip extra N this cycle.' },
  phosphorus: { low: 'Low phosphorus: apply SSP or DAP at sowing.', high: 'Phosphorus is high: skip P fertilizer this cycle.' },
  potassium: { low: 'Low potassium: apply muriate of potash (MOP).', high: 'Potassium is high: no potash needed.' },
  organicCarbon: { low: 'Low organic carbon: add compost, green manure or crop residue.', high: 'Organic carbon is good.' }
};

function analyzeSoil(soil = {}) {
  const readings = [];
  const advice = [];
  let score = 0;
  let counted = 0;
  for (const [key, r] of Object.entries(RANGES)) {
    const value = soil[key];
    if (value === undefined || value === null || value === '') continue;
    const v = Number(value);
    let level = 'optimal';
    if (v < r.low) level = 'low'; else if (v > r.high) level = 'high';
    readings.push({ key, label: r.label, value: v, level });
    if (level !== 'optimal') advice.push(ADVICE[key][level]);
    score += level === 'optimal' ? 100 : (level === 'low' ? 50 : 70);
    counted += 1;
  }
  const healthScore = counted ? Math.round(score / counted) : null;
  const rating = healthScore === null ? 'unknown' : healthScore >= 85 ? 'good' : healthScore >= 60 ? 'fair' : 'poor';
  return { healthScore, rating, readings, advice };
}

// current: {temperature, humidity, rain}; daily: [{rain, tmax, tmin, wind}]
function pestRisks(current = {}, daily = []) {
  const risks = [];
  const t = current.temperature;
  const h = current.humidity;
  const rain3 = daily.slice(0, 3).reduce((s, d) => s + (d.rain || 0), 0);
  if (h >= 80 && t >= 20 && t <= 30) risks.push({ pest: 'Fungal blight / leaf spot', severity: 'warning', why: 'Warm and humid conditions favour fungal spread.', action: 'Inspect leaves daily and apply a recommended fungicide if spots appear.' });
  if (t >= 28 && h < 60) risks.push({ pest: 'Aphids and whiteflies', severity: 'info', why: 'Hot, drier weather speeds up sucking-pest breeding.', action: 'Check the underside of leaves; use neem oil spray if you see colonies.' });
  if (rain3 >= 40) risks.push({ pest: 'Root rot and waterlogging', severity: 'critical', why: `About ${Math.round(rain3)} mm of rain is forecast in 3 days.`, action: 'Clear drainage channels and hold off on irrigation and fertilizer.' });
  if (h >= 85 && t >= 15 && t <= 25) risks.push({ pest: 'Powdery / downy mildew', severity: 'warning', why: 'Cool, very humid air promotes mildew.', action: 'Improve airflow and avoid evening irrigation.' });
  if (daily.some(d => d.tmin !== undefined && d.tmin <= 4)) risks.push({ pest: 'Frost damage', severity: 'critical', why: 'Minimum temperature is forecast near freezing.', action: 'Cover sensitive crops or irrigate lightly before dawn.' });
  return risks;
}

module.exports = { analyzeSoil, pestRisks };
