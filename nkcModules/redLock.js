const redisClient = require('../settings/redisClient');
const RedLock = require('redlock');
const { isDevelopment } = require('../settings/env');
const redLock = new RedLock([redisClient], {
  driftFactor: 0.01,
  retryCount: 150,
  retryDelay: 200,
  retryJitter: 200,
});
redLock.on('clientError', (err) => {
  if (isDevelopment) {
    console.log(err);
  }
});
module.exports = redLock;
