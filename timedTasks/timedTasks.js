const db = require("../dataModels");
const tasks = require('../tasks');
const func = {};
/*
* 定时更新活跃用户的信息 主要是头像
* */
func.cacheActiveUsers = async () => {
  setTimeout(async () => {
    try{
      await tasks.saveActiveUsersToCache();
    } catch(err) {
      console.log(err);
    } finally {
      await func.cacheActiveUsers();
    }
  }, 10 * 60 * 1000);
};

func.clearTimeoutPageCache = async () => {
  setTimeout(async () => {
    try{
      console.log(`正在清除过期页面缓存...`);
      await tasks.clearTimeoutPageCache();
      console.log(`过期页面缓存清理完成`);
    } catch (e) {
      console.log(e);
    } finally {
      await func.clearTimeoutPageCache();
    }
  }, 3 * 60 * 1000);
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
        await tasks.updateHomeRecommendThreadsByType('fixed');
        console.log(`首页推荐文章（固定图）更新完成`);
      }
    } catch(err) {
      console.log(err);
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
        await tasks.updateHomeRecommendThreadsByType('movable');
        console.log(`首页推荐文章（轮播图）更新完成`);
      }
    } catch(err) {
      console.log(err);
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
* 更新主页热门专栏
* */
func.updateHomeHotColumns = async () => {
  const homeSettings = await db.SettingModel.getSettings('home');
  setTimeout(async () => {
    try{
      console.log(`正在更新主页热门专栏...`);
      await db.ColumnModel.updateHomeHotColumns();
    } catch(err) {
      console.error(err);
    } finally {
      console.log(`主页热门专栏更新完成`);
      await func.updateHomeHotColumns();
    }
  }, homeSettings.columnPool.updateInterval * 60 * 1000);
};


/*
* 修改resource上传状态，修改两小时之前上传且状态任然处于【正在上传】的文件的状态为【上传失败】。
* */
func.clearResourceState = async() => {
  setTimeout(async () => {
    try{
      console.log(`正在处理异常资源上传状态...`);
      await tasks.clearResourceState();
    } catch(err) {
      console.log(err);
    } finally {
      console.log(`异常资源上传状态处理完成`);
      await func.clearResourceState();
    }
  }, 55 * 60 * 1000);
}

/*
* 更新专业最新文章
* */
func.updateAllForumLatestThread = async () => {
  setTimeout(async () => {
    try{
      console.log(`正在更新专业最新文章...`);
      await tasks.saveAllForumLatestThreadToRedis();
    } catch(err) {
      console.log(err);
    } finally {
      console.log(`专业最新文章更新完成`);
      await func.updateAllForumLatestThread();
    }
  }, 6 * 60 * 1000);
};

/*
* 定时更新专业文章、回复数
* @author pengxiguaa 2020/8/19
* */
func.updateForumsMessage = async () => {
  setTimeout(async () => {
    try{
      console.log(`正在更新专业文章、回复数...`);
      await tasks.updateForumsMessage();
    } catch(err) {
      console.log(err);
    } finally {
      console.log(`专业文章、回复数更新完成`);
      await func.updateForumsMessage();
    }
  }, 30 * 60 * 1000);
};

/*
* 定期更改基金修改超时的申请表的状态
* */
func.modifyTimeoutApplicationForm = async () => {
  setTimeout(async () => {
    try{
      console.log(`正在更改基金修改超时的申请表状态...`);
      await db.FundModel.modifyTimeoutApplicationForm();
    } catch(err) {
      console.log(err);
    } finally {
      console.log(`更改基金修改超时的申请表状态完成`);
      await func.modifyTimeoutApplicationForm();
    }
  }, 60 * 60 * 1000);
}

module.exports = func;
