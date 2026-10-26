require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const User = require('./models/User');
const Resource = require('./models/Resource');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));

// In production the Express server also serves the built React app
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

async function seed() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && !(await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }))) {
    await User.create({ name: 'Administrator', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    console.log('Admin user created:', ADMIN_EMAIL);
  }
  if ((await Resource.countDocuments()) === 0) {
    await Resource.insertMany([
      { name: 'Hybrid wheat seed', category: 'seeds', price: 45, unit: 'kg', stock: 500, description: 'High-yield, rust tolerant' },
      { name: 'Soybean seed', category: 'seeds', price: 90, unit: 'kg', stock: 300, description: 'Certified, 90-day variety' },
      { name: 'Urea (46% N)', category: 'fertilizer', price: 6, unit: 'kg', stock: 2000 },
      { name: 'DAP fertilizer', category: 'fertilizer', price: 28, unit: 'kg', stock: 1500 },
      { name: 'Neem oil 1L', category: 'pesticide', price: 320, unit: 'bottle', stock: 200, description: 'Organic pest control' },
      { name: 'Hand sprayer 16L', category: 'tools', price: 1450, unit: 'piece', stock: 60 }
    ]);
    console.log('Sample resources added');
  }
}

const PORT = process.env.PORT || 5001;
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is required'); process.exit(1); }

connectDB()
  .then(seed)
  .then(() => app.listen(PORT, () => console.log(`AgriTech server running on port ${PORT}`)))
  .catch(err => { console.error('Startup failed:', err.message); process.exit(1); });

module.exports = app;
