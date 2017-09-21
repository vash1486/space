/**
 * Errori standard per l'api
 */

const CustomError = require('./custom-error');

class FieldsValidationError extends CustomError {
  constructor(fields, extra) {
    const str = [];
    fields.forEach((item, index) => {
      if (str.indexOf(item.param) < 0)
        str.push(item.param);
    });
    super('Bad Request', 400, extra);
    this.fields = str;
    this.rawFields = fields;
  }
}

class BadRequestError extends CustomError {
  constructor(extra) {
    super('Bad Request', 400, extra);
  }
}

class UnauthorizedError extends CustomError {
  constructor(extra) {
    super('Unauthorized', 401, extra);
  }
}

class NotFoundError extends CustomError {
  constructor(extra) {
    super('Not Found', 404, extra);
  }
}

class ConflictError extends CustomError {
  constructor(extra) {
    super('Conflict', 409, extra);
  }
}

module.exports = {
  FieldsValidationError: FieldsValidationError,
  BadRequestError: BadRequestError,
  UnauthorizedError: UnauthorizedError,
  NotFoundError: NotFoundError,
  ConflictError: ConflictError
};
