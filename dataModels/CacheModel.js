const settings = require('../settings');
const redisClient = require('../settings/redisClient');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  key: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    required: true
  },
  type: { // visitorPage
    type: String,
    required: true,
    index: 1
  }
}, {
  collection: "caches"
});

/*
* 清除指定时间范围的缓存
* @param {Date} staringTime 开始时间
* @param {Date} endTime 结束时间
* @author pengxiguaa 2020/7/28
* */
schema.statics.clearAllCache = async () => {
  const CacheModel = mongoose.model('caches');
  const time = new Date();
  const match = {
    toc: {$lte: time}
  };
  const limit = 2000;
  while(1) {
    const caches = await CacheModel.find(match).limit(limit);
    if(!caches.length) break;
    for(const cache of caches) {
      await cache.clear();
    }
    console.log('正在清理...');
  }
};
/*
* 获取指定url的redis key
* @param {String} url 页面链接
* @author pengxiguaa 2020/7/28
 */
schema.statics.getKeysByURL = async (url) => {
  return {
    normal: {
      tocKey: `page:${url}:toc`,
      dataKey: `page:${url}:data`
    },
    reactNative: {
      tocKey: `app:RN:page:${url}:toc`,
      dataKey: `app:RN:page:${url}:data`
    },
    apiCloud: {
      tocKey: `app:AC:page:${url}:toc`,
      dataKey: `app.AC:page:${url}:data`
    }
  };
}
/*
* 清除单条缓存
* */
schema.methods.clear = async function() {
  const CacheModel = mongoose.model('caches');
  const {key} = this;
  const keys = await CacheModel.getKeysByURL(key);
  const _keys = [];
  for(const type in keys) {
    if(!keys.hasOwnProperty(type)) continue;
    for(const t in keys[type]) {
      if(!keys[type].hasOwnProperty(t)) continue;
      const key = keys[type][t];
      _keys.push(key);
    }
  }
  for(const key of _keys) {
    await redisClient.delAsync(key);
  }
  await this.remove();
};

/*
* 清除过期的缓存
* @author pengxiguaa 2020/8/19
* */
schema.statics.clearTimeoutPageCache = async () => {
  const SettingModel = mongoose.model('settings');
  const CacheModel = mongoose.model('caches');
  const cacheSettings = await SettingModel.getSettings("cache");
  const caches = await CacheModel.find({
    toc: {
      $lte: Date.now() - (cacheSettings.visitorPageCacheTime * 1000)
    }
  }).sort({toc: 1}).limit(2000);
  for(const cache of caches) {
    try{
      await cache.clear();
    } catch(err) {
      console.log(err);
    }
  }
}

module.exports = mongoose.model("caches", schema);
