const router = require('express').Router();
const Farm = require('../models/Farm');
const WeatherData = require('../models/WeatherData');
const Alert = require('../models/Alert');
const { protect, restrictTo } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { pestRisks } = require('../utils/agronomy');

const CACHE_MS = 24 * 60 * 60 * 1000;
router.use(protect);


async function fetchForecast(lat, lon) {
  // First provider: Open-Meteo
  try {
    const url = 'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=auto&forecast_days=7';

    const r = await fetch(url);

    if (!r.ok) {
      throw new Error(`Open-Meteo returned ${r.status}`);
    }

    const j = await r.json();

    return {
      current: {
        temperature: j.current.temperature_2m,
        humidity: j.current.relative_humidity_2m,
        rain: j.current.precipitation,
        wind: j.current.wind_speed_10m
      },
      daily: j.daily.time.map((date, i) => ({
        date,
        tmax: j.daily.temperature_2m_max[i],
        tmin: j.daily.temperature_2m_min[i],
        rain: j.daily.precipitation_sum[i],
        rainChance: j.daily.precipitation_probability_max[i],
        wind: j.daily.wind_speed_10m_max[i]
      }))
    };
  } catch (primaryError) {
    console.error('Open-Meteo failed:', primaryError.message);
  }

  // Backup provider: wttr.in (no API key required)
  try {
    const url =
      `https://wttr.in/${lat},${lon}?format=j1`;

    const r = await fetch(url);

    if (!r.ok) {
      throw new Error(`Backup provider returned ${r.status}`);
    }

    const j = await r.json();

    if (!j.current_condition?.[0] || !j.weather?.length) {
      throw new Error('Backup provider returned incomplete weather data');
    }

    const c = j.current_condition[0];

    return {
      current: {
        temperature: Number(c.temp_C),
        humidity: Number(c.humidity),
        rain: Number(c.precipMM),
        wind: Number(c.windspeedKmph)
      },
      daily: j.weather.map(day => ({
        date: day.date,
        tmax: Number(day.maxtempC),
        tmin: Number(day.mintempC),
        rain: Number(day.totalSnow_cm || 0) >= 0
          ? Math.max(
              0,
              ...(day.hourly || []).map(hour =>
                Number(hour.precipMM || 0)
              )
            )
          : 0,
        rainChance: Math.max(
          0,
          ...(day.hourly || []).map(hour =>
            Number(hour.chanceofrain || 0)
          )
        ),
        wind: Math.max(
          0,
          ...(day.hourly || []).map(hour =>
            Number(hour.windspeedKmph || 0)
          )
        )
      }))
    };
  } catch (backupError) {
    console.error('Backup weather provider failed:', backupError.message);

    throw Object.assign(
      new Error('Weather providers are temporarily unavailable.'),
      { status: 502 }
    );
  }
}


// Forecast + pest risk + admin alerts for one farm
router.get('/farm/:farmId', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? { _id: req.params.farmId } : { _id: req.params.farmId, owner: req.user._id };
  const farm = await Farm.findOne(filter);
  if (!farm) return res.status(404).json({ message: 'Farm not found' });

  let cached = await WeatherData.findOne({ farm: farm._id });

  if (!cached || Date.now() - cached.fetchedAt.getTime() > CACHE_MS) {
    try {
      const payload = await fetchForecast(farm.latitude, farm.longitude);
      cached = await WeatherData.findOneAndUpdate(
        { farm: farm._id },
        { payload, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      if (!cached) {
        // No saved forecast exists, so return a clear message.
        return res.status(200).json({
          farm: { id: farm._id, name: farm.name },
          weatherUnavailable: true,
          message: 'Live weather is temporarily unavailable. Please try again later.',
          current: null,
          daily: [],
          pestRisks: [],
          alerts: await Alert.find({ active: true }).sort('-createdAt').limit(10)
        });
      }

      console.log('Using saved weather forecast because the weather API is unavailable.');
    }
  }

  const { current, daily } = cached.payload;
  res.json({
    farm: { id: farm._id, name: farm.name },
    fetchedAt: cached.fetchedAt,
    current,
    daily,
    pestRisks: pestRisks(current, daily),
    alerts: await Alert.find({ active: true }).sort('-createdAt').limit(10)
  });
}));

// Admin alert management
router.get('/alerts', asyncHandler(async (req, res) => res.json(await Alert.find().sort('-createdAt'))));
router.post('/alerts', restrictTo('admin'), asyncHandler(async (req, res) => res.status(201).json(await Alert.create(req.body))));
router.delete('/alerts/:id', restrictTo('admin'), asyncHandler(async (req, res) => { await Alert.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));

module.exports = router;
