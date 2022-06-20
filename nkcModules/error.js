const HttpErrorCodes = {
  OK: 200,
  MovedPermanently: 301,
  BadRequest: 400,
  UnAuthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
  BadGateway: 502,
  ServiceUnavailable: 503,
};
const HttpErrorTypes = {
  ERR_INVALID_COOKIE: 'ERR_INVALID_COOKIE',
  ERR_FORBIDDEN: 'ERR_FORBIDDEN',
};

function ThrowError(code, type, message) {
  const error = new Error(message || type);
  error.type = type;
  error.code = code;
  throw error;
}

module.exports = {
  HttpErrorCodes,
  HttpErrorTypes,
  ThrowError
};
