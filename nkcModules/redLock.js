const redisClient = require("../settings/redisClient");
const RedLock = require("redLock");
const redLock = new RedLock([redisClient], {
  driftFactor: 0.01,
  retryCount:  150,
  retryDelay:  200,
  retryJitter:  200
});
redLock.on("clientError", (err) => {
  if(global.NKC.isDevelopment) {
    console.log(err);
  }
});
module.exports = redLock;
