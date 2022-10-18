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

const HttpErrorCodeDescription = {
  200: 'OK',
  301: 'MovedPermanently',
  400: 'BadRequest',
  401: 'UnAuthorized',
  403: 'Forbidden',
  404: 'NotFound',
  500: 'InternalServerError',
  502: 'BadGateway',
  503: 'ServiceUnavailable',
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

function ThrowErrorToRenderErrorPage(status = HttpErrorCodes.InternalServerError, template, props) {
  let {
    title = '',
    abstract = '',
    description = '',
    showLogin = false,
  } = props;
  title = title || `${status} ${HttpErrorCodeDescription[status]}`;
  const error = new Error(JSON.stringify({
    errorType: template,
    errorData: {
      title,
      abstract,
      description,
      showLogin,
    }
  }));
  error.status = status;
  throw error;
}

function ThrowErrorToRenderFullErrorPage(status, props) {
  ThrowErrorToRenderErrorPage(status, 'errorPageFull', props);
}

function ThrowErrorToRenderStaticErrorPage(status, props) {
  ThrowErrorToRenderErrorPage(status, 'errorPageStatic', props);
}

module.exports = {
  HttpErrorCodes,
  HttpErrorTypes,
  HttpErrorCodeDescription,
  ThrowError,
  ThrowErrorToRenderErrorPage,
  ThrowErrorToRenderFullErrorPage,
  ThrowErrorToRenderStaticErrorPage,
};
