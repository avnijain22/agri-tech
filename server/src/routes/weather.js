const router = require('express').Router();
const Farm = require('../models/Farm');
const WeatherData = require('../models/WeatherData');
const Alert = require('../models/Alert');
const { protect, restrictTo } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { pestRisks } = require('../utils/agronomy');

const CACHE_MS = 30 * 60 * 1000;
router.use(protect);

async function fetchForecast(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m' +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max' +
    '&timezone=auto&forecast_days=7';
    const r = await fetch(url);

    if (!r.ok) {
      const details = await r.text();
      console.error('Open-Meteo error:', r.status, details);
      throw Object.assign(
        new Error('Weather service is unavailable. Try again later.'),
        { status: 502 }
      );
    }
  const j = await r.json();
  return {
    current: { temperature: j.current.temperature_2m, humidity: j.current.relative_humidity_2m, rain: j.current.precipitation, wind: j.current.wind_speed_10m },
    daily: j.daily.time.map((date, i) => ({
      date, tmax: j.daily.temperature_2m_max[i], tmin: j.daily.temperature_2m_min[i],
      rain: j.daily.precipitation_sum[i], rainChance: j.daily.precipitation_probability_max[i], wind: j.daily.wind_speed_10m_max[i]
    }))
  };
}

// Forecast + pest risk + admin alerts for one farm
router.get('/farm/:farmId', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? { _id: req.params.farmId } : { _id: req.params.farmId, owner: req.user._id };
  const farm = await Farm.findOne(filter);
  if (!farm) return res.status(404).json({ message: 'Farm not found' });

  let cached = await WeatherData.findOne({ farm: farm._id });
  if (!cached || Date.now() - cached.fetchedAt.getTime() > CACHE_MS) {
    const payload = await fetchForecast(farm.latitude, farm.longitude);
    cached = await WeatherData.findOneAndUpdate({ farm: farm._id }, { payload, fetchedAt: new Date() }, { upsert: true, new: true });
  }
  const { current, daily } = cached.payload;
  res.json({
    farm: { id: farm._id, name: farm.name }, fetchedAt: cached.fetchedAt, current, daily,
    pestRisks: pestRisks(current, daily),
    alerts: await Alert.find({ active: true }).sort('-createdAt').limit(10)
  });
}));

// Admin alert management
router.get('/alerts', asyncHandler(async (req, res) => res.json(await Alert.find().sort('-createdAt'))));
router.post('/alerts', restrictTo('admin'), asyncHandler(async (req, res) => res.status(201).json(await Alert.create(req.body))));
router.delete('/alerts/:id', restrictTo('admin'), asyncHandler(async (req, res) => { await Alert.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));

module.exports = router;
