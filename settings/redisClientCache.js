// rate limit 模块所用到的redis客户端
const redisConfig = require('../config/redis.json');
const Redis = require('ioredis');

let client = null;

module.exports = async () => {
  if(!client) {
    client = new Redis({
      port: redisConfig.port,
      host: redisConfig.address,
      password: redisConfig.password,
      db: redisConfig.db
    });
  }
  return client;
}
