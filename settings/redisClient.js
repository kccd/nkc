const Redis = require('redis');
const Bluebird = require('bluebird');
Bluebird.promisifyAll(Redis.RedisClient.prototype);
Bluebird.promisifyAll(Redis.Multi.prototype);

/*
* 重置redis集合
* @param {String} key 键名
* @param {Array} values 新数据
* @author pengxiguaa 2020/7/29
* */
Redis.RedisClient.prototype.resetSetAsync = async function(key, values = []) {
  const _values = await this.smembersAsync(key);
  const _removeValues = _values.filter(v => !values.includes(v));
  if(_removeValues.length) await this.sremAsync(key, _removeValues);
  if(values.length) {
    await this.saddAsync(key, values);
  } else {
    await this.delAsync(key);
  }
};

const redisConfig = require('../config/redis');
const client = Redis.createClient({
  host: redisConfig.host,
  port: redisConfig.port,
  db: 1
});

module.exports = client;
/*
* 键名 uid(用户ID)
* user:uid:subscribeForumsId array
* user:uid:subscribeUsersId array
* user:uid:subscribeThreadsId array
* user:uid:subscribeColumnsId array
* user:uid:collectionThreadsId array
*
* forums:topicsId array 话题ID
* forums:disciplinesId array 学科ID
*
* 关注分类
* 全部
* user:uid:subscribeTypesId array 所有自定义分类ID+all+other
* user:uid:subscribeType:all:column array 专栏ID
* user:uid:subscribeType:all:thread array 文章ID
* user:uid:subscribeType:all:user array 用户ID
* user:uid:subscribeType:all:topic array 话题ID
* user:uid:subscribeType:all:discipline array 学科ID
* 未分类
* user:uid:subscribeType:other:column
* user:uid:subscribeType:other:thread
* user:uid:subscribeType:other:user
* user:uid:subscribeType:other:topic
* user:uid:subscribeType:other:discipline
* 自定义分类 subscribeTypeId(自定义分类ID)
* user:uid:subscribeType:subscribeTypeId:column
* user:uid:subscribeType:subscribeTypeId:thread
* user:uid:subscribeType:subscribeTypeId:user
* user:uid:subscribeType:subscribeTypeId:topic
* user:uid:subscribeType:subscribeTypeId:discipline
*

*
*
* 设置 settingsId(设置ID)
* settings:settingsId json string
*
* 一周活跃用户
* activeUsers array [{uid: 用户ID, avatar: 头像}, {}, ...]
*
* 轮播图
* visitor:ads [{tid: 文章ID, title: 文章标题}, {}, ...]
*
* 针对游客的全局页面缓存 url: 网页链接
* page:url:toc 缓存创建的时间
* page:url:data html字符串
*
* 数据类型
* 1. string字符创  setAsync, getAsync
* 2. Set集合 saddAsync, smembersAsync
*
*
* 删除键： delAsync
* */

/*
* 用户证书
* role:${roleId} = jsonString roleObj
* role:keys = jsonString [roleId, ...]
*
* 专业分类
* forumCategories = jsonString [CategoryObj, ...]
*
* forum:${fid}:latestThreads jsonString [threadObj, ...]
*
* 权限 操作
* operation:${operationId} = jsonString operationObj
 */
