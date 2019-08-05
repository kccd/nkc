const db = require("./dataModels");
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

module.exports = func;