export function errorMiddleware(err, req, res, next) {
  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  if (statusCode >= 500) {
    console.error(err.message);
  }

  res.status(statusCode).json({ error: message || 'Something went wrong' });
}
