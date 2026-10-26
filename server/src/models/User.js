const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['farmer', 'admin', 'expert'], default: 'farmer' },
  phone: String,
  language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matches = function (plain) { return bcrypt.compare(plain, this.password); };

module.exports = mongoose.model('User', userSchema);
