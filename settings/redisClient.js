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
/*
* 键名
* user:[uid]:subscribeForumsId array
* user:[uid]:subscribeUsersId array
* user:[uid]:subscribeThreadsId array
* user:[uid]:subscribeColumnsId array
* user:[uid]:collectionThreadsId array
*
* forums:topicsId
* forums:disciplinesId
*
*
*
* 数据类型
* 1. string字符创  setAsync, getAsync
* 2. Set集合 saddAsync, smembersAsync
*
*
* 删除键： delAsync
* */