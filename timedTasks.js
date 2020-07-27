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

/*
* 定时更新首页的固定推荐文章
* @author pengxiguaa 2020/7/16
* */
func.updateFixedRecommendThreads = async () => {
  const homeSettings = await db.SettingModel.getSettings('home');
  setTimeout(async () => {
    try{
      if(homeSettings.recommendThreads.fixed.displayType !== 'manual') {
        console.log(`开始更新首页推荐文章（固定图）...`);
        await db.ThreadModel.updateHomeRecommendThreadsByType('fixed');
        console.log(`首页推荐文章（固定图）更新完成`);
      }
    } catch(err) {
      if(global.NKC.NODE_ENV !== 'production') {
        console.log(err);
      }
    } finally {
      await func.updateFixedRecommendThreads();
    }
  }, homeSettings.recommendThreads.fixed.timeInterval * 60 * 60 * 1000);
}
/*
* 定时更新首页的轮播图推荐文章
* @author pengxiguaa 2020/7/16
* */
func.updateMovableRecommendThreads = async () => {
  const homeSettings = await db.SettingModel.getSettings('home');
  setTimeout(async () => {
    try{
      if(homeSettings.recommendThreads.movable.displayType !== 'manual') {
        console.log(`开始更新首页推荐文章（轮播图）...`);
        await db.ThreadModel.updateHomeRecommendThreadsByType('movable');
        console.log(`首页推荐文章（轮播图）更新完成`);
      }
    } catch(err) {
      if(global.NKC.NODE_ENV !== 'production') {
        console.log(err);
      }
    } finally {
      await func.updateMovableRecommendThreads();
    }
  }, homeSettings.recommendThreads.movable.timeInterval * 60 * 60 * 1000);
}
/*
* 更新首页的推荐文章
* */
func.updateRecommendThreads = async () => {
  await func.updateFixedRecommendThreads();
  await func.updateMovableRecommendThreads();
}


/*
* 修改resource上传状态，修改两小时之前上传且状态任然处于【正在上传】的文件的状态为【上传失败】。
* */
func.clearResourceState = async() => {
  setTimeout(async () => {
    try{
      console.log(`正在处理异常资源上传状态...`);
      const time = Date.now() - 2*60*60*1000;
      await db.ResourceModel.updateMany({
        toc: {$lte: time},
        state: 'inProcess'
      }, {
        $set: {
          state: 'useless'
        }
      });
    } catch(err) {
      if(global.NKC.NODE_ENV !== 'production') {
        console.log(err);
      }
    } finally {
      console.log(`异常资源上传状态处理完成`);
      await func.clearResourceState();
    }
  }, 60*60*1000);
}

module.exports = func;
