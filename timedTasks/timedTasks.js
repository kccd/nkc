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
/*
* 定时更新最新注册用户
* */
func.cacheNewUsers = async () => {
  setTimeout(async () => {
    try{
      await tasks.saveNewUsersToCache();
    } catch(err) {
      console.log(err);
    } finally {
      await func.cacheNewUsers();
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

/*
* 定期判断基金申请是否未结题但已经超过项目周期,每12小时判断一次
* */
func.modifyProjectCycle = async () =>{
  setTimeout(async () =>{
    try{
    console.log("正在处理超时未结题的基金申请...")
    await db.MessageModel.sendFinishProject();
    } catch(err) {
      console.log(err)
    } finally {
      console.log("处理完成");
      await func.modifyProjectCycle();
    }
  },12 * 60 * 60 * 1000)
}

/*
* 定时更新首页自定模块中的文章列表
* */
const initHomeBlocksId = [];
func.initHomeBlocksTimeout = async () => {
  setTimeout(async () => {
    try{
      console.log(`正在处理首页自定义文章列表...`);
      const blocks = await db.HomeBlockModel.find({
        _id: {
          $nin: initHomeBlocksId
        }
      }, {_id: 1});
      for(const block of blocks) {
        await func.initHomeBlockTimeout(block._id);
        initHomeBlocksId.push(block._id);
      }
    } catch(err) {
      console.log(err);
    } finally {
      console.log(`首页自定义文章列表处理完成`);
      await func.initHomeBlocksTimeout();
    }
  }, 60 * 1000);
};

func.initHomeBlockTimeout = async (blockId) => {
  const block = await db.HomeBlockModel.findOne({_id: blockId});
  if(!block) return;
  setTimeout(async () => {
    try{
      console.log(`正在更新首页自定义文章列表...`);
      await block.updateThreadsId();
    } catch(err) {
      console.log(err);
    } finally {
      console.log(`首页自定义文章列表更新完成`);
      await func.initHomeBlockTimeout(blockId);
    }
  }, block.updateInterval * 60 * 60 * 1000)
};

module.exports = func;
