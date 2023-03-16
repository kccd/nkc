const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const processId = Number(process.env.PROCESS_ID) || 0;

module.exports = {
  isProduction,
  isDevelopment,
  processId,
};
