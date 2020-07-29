/*
* 启动时缓存必要数据到redis
* */
const db = require('../dataModels');
const client = require('../settings/redisClient');
const cacheForums = require('./cacheForums');
module.exports = async () => {
  // 清空redis数据库
  // await client.flushdbAsync();
  // 清空缓存表
  // await CacheModel.remove();

  // 专业权限相关
  await cacheForums();
  // 用户等级
  await db.RoleModel.saveRolesToRedis();
  // 一周活跃用户
  await db.ActiveUserModel.saveActiveUsersToCache();
  // 专业分类
  await db.ForumCategoryModel.saveCategoryToRedis();
  // 专业最新文章
  await db.ForumModel.saveAllForumLatestThreadToRedisAsync();

}
