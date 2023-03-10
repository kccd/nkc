const { ResponseTypes } = require('../settings/response');
// 响应类型类型对应的状态码
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

// 状态码对应的响应类型
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

// 抛出错误的类型
// 1. 指定响应类型，调翻译组件合成错误信息；
// 2. 指定错误页面；
// 3. 常规错误；
const ErrorTypes = {
  RESPONSE_TYPE: 'RESPONSE_TYPE',
  ERROR_PAGE: 'ERROR_PAGE',
  COMMON: 'COMMON',
};

// 抛出错误
// 会将错误类型、状态码以及错误对应参数以JSON形式存入错误信息中
function ThrowErrorCore(type, status, args = []) {
  const error = new Error(
    JSON.stringify({
      type,
      args,
      status,
    }),
  );
  error.status = status;
  throw error;
}

function ThrowResponseTypeError(status, responseType, args = []) {
  if (!Array.isArray(args)) {
    args = [args];
  }
  ThrowErrorCore(ErrorTypes.RESPONSE_TYPE, status, {
    responseType,
    args,
  });
}

function ThrowErrorPageError(status, errorPage, errorData) {
  ThrowErrorCore(ErrorTypes.ERROR_PAGE, status, {
    errorPage,
    errorData,
  });
}

function ThrowCommonError(status, message) {
  ThrowErrorCore(ErrorTypes.COMMON, status, {
    message,
  });
}

function ThrowServerInternalError(content) {
  ThrowResponseTypeError(
    HttpErrorCodes.InternalServerError,
    ResponseTypes.ERROR_TEMPLATE,
    content,
  );
}

function ThrowForbiddenResponseTypeError(responseType, args = []) {
  ThrowResponseTypeError(HttpErrorCodes.Forbidden, responseType, args);
}

function ThrowBadRequestResponseTypeError(responseType, args = []) {
  ThrowResponseTypeError(HttpErrorCodes.BadRequest, responseType, args);
}

function ThrowForbiddenErrorPageError(errorPage, errorData) {
  ThrowErrorPageError(HttpErrorCodes.Forbidden, errorPage, errorData);
}

function ThrowError(code, type, message) {
  const error = new Error(message || type);
  error.type = type;
  error.code = code;
  throw error;
}

function ThrowErrorToRenderErrorPage(
  status = HttpErrorCodes.InternalServerError,
  template,
  props,
) {
  let {
    title = '',
    abstract = '',
    description = '',
    showLogin = false,
  } = props;
  title = title || `${status} ${HttpErrorCodeDescription[status]}`;
  ThrowErrorPageError(status, template, {
    title,
    abstract,
    description,
    showLogin,
  });
}

function ThrowErrorToRenderFullErrorPage(status, props) {
  ThrowErrorToRenderErrorPage(status, 'errorPageFull', props);
}

function ThrowErrorToRenderStaticErrorPage(status, props) {
  ThrowErrorToRenderErrorPage(status, 'errorPageStatic', props);
}

module.exports = {
  ErrorTypes,
  HttpErrorCodes,
  HttpErrorTypes,
  HttpErrorCodeDescription,
  ThrowError,
  ThrowErrorPageError,
  ThrowCommonError,
  ThrowErrorToRenderErrorPage,
  ThrowErrorToRenderFullErrorPage,
  ThrowErrorToRenderStaticErrorPage,
  ThrowForbiddenResponseTypeError,
  ThrowBadRequestResponseTypeError,
  ThrowServerInternalError,
  ThrowForbiddenErrorPageError,
};
