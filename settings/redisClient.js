const Redis = require('redis');
const Bluebird = require('bluebird');
Bluebird.promisifyAll(Redis.RedisClient.prototype);
Bluebird.promisifyAll(Redis.Multi.prototype);
const redisConfig = require('../config/redis');
const client = Redis.createClient({
  host: redisConfig.host,
  port: redisConfig.port,
  db: 1
});
module.exports = client;