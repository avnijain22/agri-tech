
const router = require('express').Router();

const Farm = require('../models/Farm');
const WeatherData = require('../models/WeatherData');
const Alert = require('../models/Alert');

const { protect, restrictTo } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { pestRisks } = require('../utils/agronomy');

const CACHE_MS = 24 * 60 * 60 * 1000;

router.use(protect);

// Convert farm location into latitude and longitude
async function getFarmCoordinates(location) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to find farm location.');
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Location not found: ${location}`);
  }

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude
  };
}

// Fetch weather forecast using Open-Meteo
async function fetchForecast(lat, lon) {
  try {
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=auto&forecast_days=7';

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.current || !data.daily || !data.daily.time) {
      throw new Error('Incomplete weather data received.');
    }

    return {
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        rain: data.current.precipitation,
        wind: data.current.wind_speed_10m
      },

      daily: data.daily.time.map((date, i) => ({
        date,
        tmax: data.daily.temperature_2m_max[i],
        tmin: data.daily.temperature_2m_min[i],
        rain: data.daily.precipitation_sum[i],
        rainChance: data.daily.precipitation_probability_max[i],
        wind: data.daily.wind_speed_10m_max[i]
      }))
    };

  } catch (primaryError) {
    console.error('Open-Meteo failed:', primaryError.message);
  }

  // Backup provider: wttr.in
  try {
    const url = `https://wttr.in/${lat},${lon}?format=j1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Backup provider returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.current_condition?.[0] || !data.weather?.length) {
      throw new Error('Backup provider returned incomplete data.');
    }

    const current = data.current_condition[0];

    return {
      current: {
        temperature: Number(current.temp_C),
        humidity: Number(current.humidity),
        rain: Number(current.precipMM),
        wind: Number(current.windspeedKmph)
      },

      daily: data.weather.map(day => ({
        date: day.date,
        tmax: Number(day.maxtempC),
        tmin: Number(day.mintempC),

        rain: Math.max(
          0,
          ...(day.hourly || []).map(hour =>
            Number(hour.precipMM || 0)
          )
        ),

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

// GET weather forecast for one farm
router.get(
  '/farm/:farmId',
  asyncHandler(async (req, res) => {

    // Support both older owner records and newer user records
    let farm;

    if (req.user.role === 'admin') {
      farm = await Farm.findById(req.params.farmId);
    } else {
      farm = await Farm.findOne({
        _id: req.params.farmId,
        $or: [
          { user: req.user._id },
          { owner: req.user._id }
        ]
      });
    }

    if (!farm) {
      return res.status(404).json({
        message: 'Farm not found'
      });
    }

    let cached = await WeatherData.findOne({
      farm: farm._id
    });

    // Fetch fresh weather if cache is missing or expired
    if (
      !cached ||
      Date.now() - cached.fetchedAt.getTime() > CACHE_MS
    ) {
      try {
        const coordinates = await getFarmCoordinates(farm.location);

        const payload = await fetchForecast(
          coordinates.latitude,
          coordinates.longitude
        );

        cached = await WeatherData.findOneAndUpdate(
          { farm: farm._id },
          {
            payload,
            fetchedAt: new Date()
          },
          {
            upsert: true,
            new: true,
            runValidators: true
          }
        );

      } catch (err) {
        console.error('Farm weather error:', err.message);

        if (!cached) {
          return res.status(200).json({
            farm: {
              id: farm._id,
              name: farm.farmName
            },
            weatherUnavailable: true,
            message: 'Live weather is temporarily unavailable. Please check the farm location and try again.',
            current: null,
            daily: [],
            pestRisks: [],
            alerts: await Alert.find({ active: true })
              .sort('-createdAt')
              .limit(10)
          });
        }

        console.log(
          'Using saved weather forecast because the weather API is unavailable.'
        );
      }
    }

    const { current, daily } = cached.payload;

    res.json({
      farm: {
        id: farm._id,
        name: farm.farmName
      },

      fetchedAt: cached.fetchedAt,
      current,
      daily,
      pestRisks: pestRisks(current, daily),

      alerts: await Alert.find({ active: true })
        .sort('-createdAt')
        .limit(10)
    });
  })
);

// Admin alert management
router.get(
  '/alerts',
  asyncHandler(async (req, res) => {
    res.json(
      await Alert.find().sort('-createdAt')
    );
  })
);

router.post(
  '/alerts',
  restrictTo('admin'),
  asyncHandler(async (req, res) => {
    res.status(201).json(
      await Alert.create(req.body)
    );
  })
);

router.delete(
  '/alerts/:id',
  restrictTo('admin'),
  asyncHandler(async (req, res) => {
    await Alert.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Deleted'
    });
  })
);

module.exports = router;
