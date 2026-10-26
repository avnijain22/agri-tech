const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  res.status(400).json({ message: result.array().map(e => e.msg).join(', '), errors: result.array() });
};
