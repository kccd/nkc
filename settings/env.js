const NODE_ENV =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

const isProduction = NODE_ENV === 'production';
const isDevelopment = !isProduction;

const processId = Number(process.pid) || 0;

global.throwErr = function (status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
};

module.exports = {
  NODE_ENV,
  isProduction,
  isDevelopment,
  processId,
};
