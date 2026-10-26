const mongoose = require('mongoose');

// Community forum posts + expert consultation questions
module.exports = mongoose.model('Post', new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  type: { type: String, enum: ['forum', 'consultation'], default: 'forum' },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['open', 'answered'], default: 'open' },
  hidden: { type: Boolean, default: false },
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    authorRole: String,
    body: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true }));
