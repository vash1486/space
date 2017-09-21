class CustomError extends Error {
  constructor(message, status, extra) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    if (status) this.status = status;
    if (extra) this.extra = extra;
  }
}

module.exports = CustomError;
