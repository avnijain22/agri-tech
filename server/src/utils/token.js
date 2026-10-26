const jwt = require('jsonwebtoken');
exports.sign = user => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
exports.publicUser = u => ({ id: u._id, name: u.name, email: u.email, role: u.role, language: u.language, phone: u.phone });
