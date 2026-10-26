const router = require('express').Router();
const Post = require('../models/Post');
const { protect, restrictTo } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const filter = { hidden: false };
  if (req.query.type) filter.type = req.query.type;
  // Consultations are private to the asker, experts and admins
  if (req.query.type === 'consultation' && req.user.role === 'farmer') filter.author = req.user._id;
  res.json(await Post.find(filter).sort('-createdAt').limit(100));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, body, type } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'Title and message are required' });
  const post = await Post.create({ title, body, type: type === 'consultation' ? 'consultation' : 'forum', author: req.user._id, authorName: req.user.name });
  res.status(201).json(post);
}));

router.post('/:id/reply', asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.hidden) return res.status(404).json({ message: 'Not found' });
  if (post.type === 'consultation' && req.user.role === 'farmer' && String(post.author) !== String(req.user._id))
    return res.status(403).json({ message: 'This consultation is private' });
  if (!req.body.body) return res.status(400).json({ message: 'Write a reply first' });
  post.replies.push({ author: req.user._id, authorName: req.user.name, authorRole: req.user.role, body: req.body.body });
  if (post.type === 'consultation' && ['expert', 'admin'].includes(req.user.role)) post.status = 'answered';
  await post.save();
  res.status(201).json(post);
}));

// Moderation (admin only)
router.patch('/:id/hide', restrictTo('admin'), asyncHandler(async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { hidden: true });
  res.json({ message: 'Hidden' });
}));

module.exports = router;
