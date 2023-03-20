const NODE_ENV =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

const isProduction = NODE_ENV === 'production';
const isDevelopment = !isProduction;

const processId = Number(process.pid) || 0;

module.exports = {
  NODE_ENV,
  isProduction,
  isDevelopment,
  processId,
};
