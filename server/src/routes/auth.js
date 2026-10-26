const router = require('express').Router();
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { sign, publicUser } = require('../utils/token');

router.post('/register',
  [body('name').trim().notEmpty().withMessage('Name is required'),
   body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, language } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: 'That email is already registered' });
    // Role is always "farmer" on public signup; admins promote users from the dashboard.
    const user = await User.create({ name, email, password, phone, language, role: 'farmer' });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  }));

router.post('/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.matches(req.body.password)) || !user.active)
      return res.status(401).json({ message: 'Incorrect email or password' });
    res.json({ token: sign(user), user: publicUser(user) });
  }));

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

router.patch('/me', protect, asyncHandler(async (req, res) => {
  const { name, phone, language } = req.body;
  Object.assign(req.user, Object.fromEntries(Object.entries({ name, phone, language }).filter(([, v]) => v !== undefined)));
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}));

module.exports = router;
