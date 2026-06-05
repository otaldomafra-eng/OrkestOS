// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  console.log('[WiseMindOS] ' + err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
};
