module.exports= function ErrorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode ?? 500;
  let message = err.message;
  console.log("-----------Global error handler fired-----------");
  res.status(statusCode).json({ msg: message });
}
