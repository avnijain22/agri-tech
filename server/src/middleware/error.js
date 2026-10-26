const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', '..', 'logs');

function logToFile(line) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'error.log'), line + '\n');
  } catch { /* logging must never crash the app */ }
}

exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.code === 11000) { status = 409; message = 'Duplicate value: ' + Object.keys(err.keyValue || {}).join(', '); }
  if (status >= 500) logToFile(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${err.stack}`);
  res.status(status).json({ message });
};

exports.asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
