const axios = require("axios");

// GET /api/weather?city=Bhopal
exports.getWeather = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "city query is required" });

    const params = { q: city, units: "metric", appid: process.env.OPENWEATHER_KEY };
    const base = "https://api.openweathermap.org/data/2.5";

    const [current, forecast] = await Promise.all([
      axios.get(`${base}/weather`, { params }),
      axios.get(`${base}/forecast`, { params }),
    ]);

    const c = current.data;
    res.json({
      city: c.name,
      temperature: c.main.temp,
      humidity: c.main.humidity,
      description: c.weather[0].description,
      windSpeed: c.wind.speed,
      // one reading every 8 steps (3h each) is roughly one per day
      forecast: forecast.data.list
        .filter((_, i) => i % 8 === 0)
        .map((f) => ({
          date: f.dt_txt,
          temp: f.main.temp,
          description: f.weather[0].description,
          rainChance: Math.round((f.pop || 0) * 100),
        })),
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "City not found" });
    }
    next(err);
  }
};
