const db = require("./dataModels");
const redisClient = require("./settings/redisClient");
const func = {};
/*
* 定时更新活跃用户的信息 主要是头像
* */
func.cacheActiveUsers = async () => {
  setTimeout(async () => {
    try{
      await db.ActiveUserModel.saveActiveUsersToCache();
    } catch(err) {
      if(global.NKC.NODE_ENV !== "production") {
        console.log(err);
      }
    } finally {
      await func.cacheActiveUsers();
    }
  }, 120000);
};

func.cacheAds = async () => {
  setTimeout(async () => {
    try{
      await db.ThreadModel.cacheAds();
    } catch(err) {
      if(global.NKC.NODE_ENV !== "production") {
        console.log(err);
      }
    } finally {
      await func.cacheAds();
    }
  }, 120000);
};

func.clearTimeoutPageCache = async () => {
  setTimeout(async () => {
    try{
      const cacheSettings = await db.SettingModel.getSettings("cache");
      const caches = await db.CacheModel.find({
        toc: {
          $lte: Date.now() - (cacheSettings.visitorPageCacheTime * 1000)
        }
      }).sort({toc: 1}).limit(500);
      for(const cache of caches) {
        try{
          const {key} = cache;
          await redisClient.delAsync(`page:${key}:toc`);
          await redisClient.delAsync(`page:${key}:data`);
          await cache.remove();
        } catch(err) {
          if(global.NKC.NODE_ENV !== "production") {
            console.log(err);
          }
        }
      }
    } catch (e) {
      if(global.NKC.NODE_ENV !== "production") {
        console.log(e);
      }
    } finally {
      await func.clearTimeoutPageCache();
    }
  }, 180000);
};

module.exports = func;