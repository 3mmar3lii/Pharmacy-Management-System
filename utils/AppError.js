module.exports = class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.message = message;
    this.statusCode = status;
    this.statusMsg = String(status).startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
};
