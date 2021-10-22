const mongoose = require('../settings/database');
const apiFunction = require("../nkcModules/apiFunction");
const schema = new mongoose.Schema({
  _id: String,
  // 是否为默认分类
  defaultBlock: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 模块名称
  name: {
    type: String,
    default: '',
    index: 1
  },
  // 专业 ID
  forumsId: {
    type: [String],
    default: [],
  },
  // 文章属性 ID
  tcId: {
    type: [Number],
    default: []
  },
  // 是否必须为精选文章
  digest: {
    type: Boolean,
    default: false
  },
  // 是否必须为原创
  origin: {
    type: Boolean,
    default: false,
  },
  // 回复数最小值
  postCountMin: {
    type: Number,
    default: 0
  },
  // 点赞数最小值
  voteUpMin: {
    type: Number,
    default: 0
  },
  // 文章加所有回复的点赞数最小值
  voteUpTotalMin: {
    type: Number,
    default: 0,
  },
  // 最大点踩数
  voteDownMax: {
    type: Number,
    default: 0
  },
  // 更新的间隔时间 小时
  updateInterval: {
    type: Number,
    default: 1
  },
  // 发表时间距离当前 最小值 天
  timeOfPostMin: {
    type: Number,
    default: 0
  },
  // 发表时间距离当前 最大值 天
  timeOfPostMax: {
    type: Number,
    default: 999
  },
  // 文章列表风格
  threadStyle: {
    type: String, // abstract: 摘要模式, brief: 简略模式, minimalist
    default: ''
  },
  // 文章列表 css 样式
  blockStyle: {
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    usernameColor: {
      type: String,
      default: '#3494da'
    },
    forumColor: {
      type: String,
      default: '#3494da'
    },
    titleColor: {
      type: String,
      default: '#000000'
    },
    abstractColor: {
      type: String,
      default: '#000000'
    },
    infoColor: {
      type: String,
      default: '#333333'
    }
  },
  // 文章封面图位置
  coverPosition: {
    type: String,
    default: 'left', // left, right
  },
  // 文章篇数
  threadCount: {
    type: Number,
    default: 10
  },
  // 屏蔽
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 手动推送文章显示条数
  fixedThreadCount: {
    type: Number,
    default: 0,
  },
  // 自动推送文章入选条数
  autoThreadCount: {
    type: Number,
    default: 0,
  },
  // 自动选择的文章 ID
  autoThreadsId: {
    type: [String],
    default: []
  },
  // 手动选择的文章 ID
  fixedThreadsId: {
    type: [String],
    default: []
  },
  // 显示时的排序
  sort: {
    type: String,
    default: 'random', // random, toc, postCount, voteUpCount
  },
  // 在页面中的位置
  position: {
    type: String,
    default: 'left',  // left, right
  },
  // 模块排序
  order: {
    type: Number,
    default: 1,
    index: 1
  }
}, {
  collection: 'homeBlocks'
});

/*
* 获取默认模块的 ID
* @return {[String]}
* */
schema.statics.getDefaultHomeBlocksId = async () => {
  const HomeBlockModel = mongoose.model('homeBlocks');
  const blocks = await HomeBlockModel.find({defaultBlock: true}, {_id: 1});
  return blocks.map(b => b._id);
};

schema.statics.checkBlockValue = async (block) => {
  const {checkString, checkNumber} = require('../nkcModules/checkData');
  const ForumModel = mongoose.model('forums');
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const {
    name,
    forumsId,
    tcId,
    postCountMin,
    voteUpMin,
    voteUpTotalMin,
    voteDownMax,
    updateInterval,
    timeOfPostMin,
    timeOfPostMax,
    threadStyle,
    coverPosition,
    threadCount,
    fixedThreadCount,
    autoThreadCount,
  } = block;
  checkString(name, {
    name: '模块名',
    minLength: 0,
    maxLength: 100
  });
  if(forumsId.length > 0) {
    const forums = await ForumModel.find({fid: {$in: forumsId}}, {fid: 1});
    const forumsObj = {};
    forums.map(f => forumsObj[f.fid] = true);
    for(const fid of forumsId) {
      if(!forumsObj[fid]) throwErr(400, `专业 ID 错误，fid: ${fid}`);
    }
  }
  if(tcId.length > 0) {
    const categories = await ThreadCategoryModel.find({_id: {$in: tcId}}, {_id: 1});
    const categoriesObj = {};
    categories.map(c => categoriesObj[c._id] = true);
    for(const id of tcId) {
      if(!categoriesObj[id]) throwErr(400, `文章属性 ID 错误，cid: ${id}`);
    }
  }
  checkNumber(postCountMin, {
    name: '最小回复数',
    min: 0
  });
  checkNumber(voteUpMin, {
    name: '最小点赞数',
    min: 0
  });
  checkNumber(voteDownMax, {
    name: '最大点踩数',
    min: 0
  });
  checkNumber(voteUpTotalMin, {
    name: '文章总点赞数',
    min: 0
  });
  checkNumber(updateInterval, {
    name: '更新间隔时间',
    min: 0.01,
    fractionDigits: 2
  });
  checkNumber(timeOfPostMin, {
    name: '最短发表天数',
    min: 0,
    fractionDigits: 2
  });
  checkNumber(timeOfPostMax, {
    name: '最大发表天数',
    min: 0,
    fractionDigits: 2
  });
  if(!['abstract', 'brief', 'minimalist'].includes(threadStyle)) {
    throwErr(400, `文章列表风格设置错误`);
  }
  if(!['left', 'right'].includes(coverPosition)) {
    throwErr(400, `文章封面图位置设置错误`);
  }
  checkNumber(threadCount, {
    name: '文章数目',
    min: 1
  });
  checkNumber(fixedThreadCount, {
    name: '手动推选文章显示条数',
    min: 0,
  });
  checkNumber(autoThreadCount, {
    name: '自动推送文章入选条数',
    min: 0
  });
}
/*
* @param {[String]} fidOfCanGetThreads 可访问的专业 ID
* @param {[Object]} 文章对象组成的数组
* */
schema.methods.extendData = async function(fidOfCanGetThreads) {
  const ThreadModel = mongoose.model('threads');
  const apiFunction = require('../nkcModules/apiFunction');
  const {
    autoThreadsId,
    fixedThreadsId,
    fixedThreadCount,
    threadCount,
  } = this;
  if(threadCount <= 0) {
    return [];
  }
  const _fixedThreadsId = apiFunction.arrayShuffle(fixedThreadsId);
  let selectedThreadsId = _fixedThreadsId.slice(0, fixedThreadCount);
  const autoThreadsCount = threadCount - selectedThreadsId.length;
  const _autoThreadsId = apiFunction.arrayShuffle(autoThreadsId);
  selectedThreadsId = selectedThreadsId.concat(_autoThreadsId.slice(0, autoThreadsCount));
  if(selectedThreadsId.length === 0) {
    return [];
  }
  let threads = await ThreadModel.find({
    tid: {
      $in: selectedThreadsId
    },
    disabled: false,
    mainForumsId: {
      $in: fidOfCanGetThreads
    }
  });
  threads = await ThreadModel.extendThreads(threads, {
    category: true,
    htmlToText: true,
    removeLink: true,
  });
  return threads;
}

schema.statics.getHomeBlockData = async (props) => {
  const SettingModel = mongoose.model('settings');
  const ThreadModel = mongoose.model('threads');
  const ColumnModel = mongoose.model('columns');
  const HomeBlockModel = mongoose.model('homeBlocks');
  const ShopGoodsModel = mongoose.model('shopGoods');
  const {
    fidOfCanGetThreads = [],
    showDisabledBlock = false
  } = props;
  let {showShopGoods} = await SettingModel.getSettings('home');
  const {movable, fixed} = await ThreadModel.getHomeRecommendThreads(fidOfCanGetThreads);
  const match = {};
  if(!showDisabledBlock) {
    match.disabled = false;
  }
  const homeBlocks = await HomeBlockModel.find(match).sort({order: 1});
  // 置顶专栏
  const defaultData = {
    toppedThreads: await ThreadModel.getHomeToppedThreads(fidOfCanGetThreads),
    toppedColumns: await ColumnModel.getHomeToppedColumns(),
    hotColumns: await ColumnModel.getHomeHotColumns(),
    recommendThreadsMovable: movable,
    recommendThreadsFixed: fixed,
    management: [],
    goods: [],
    forums: []
  };
  // 热销商品
  if(showShopGoods) {
    defaultData.goods = await ShopGoodsModel.getHomeGoods();
  }
  const homeBlocksData = {
    left: [],
    right: []
  };
  for(const homeBlock of homeBlocks) {
    const {_id, defaultBlock, name, position} = homeBlock;

    let homeBlockData = {
      _id,
      defaultBlock,
      name,
    };

    if(defaultBlock) {
      homeBlockData.data = defaultData[_id];
    } else {
      homeBlockData.data = await homeBlock.extendData(fidOfCanGetThreads);
    }
    homeBlocksData[position].push(homeBlockData);
  }
  return homeBlocksData;
};

/*
* 更新自动推送的文章
* */
schema.methods.updateThreadsId = async function() {
  const PostModel = mongoose.model('posts');
  const {
    forumsId,
    tcId,
    digest,
    origin,
    postCountMin,
    voteUpMin,
    voteUpTotalMin,
    voteDownMax,
    timeOfPostMin,
    timeOfPostMax,
    autoThreadCount,
  } = this;
  const match = {
    type: 'thread',
    disabled: false,
    toDraft: {$ne: true},
    toc: {
      $gte: new Date(Date.now() - (timeOfPostMax * 24 * 60 * 60 * 1000)),
      $lte: new Date(Date.now() - (timeOfPostMin * 24 * 60 * 60 * 1000)),
    },
    threadPostCount: {
      $gte: postCountMin
    },
    voteUpTotal: voteUpTotalMin,
    voteUp: voteUpMin,
    voteDown: {$lte: voteDownMax}
  };
  if(forumsId.length > 0) {
    match.mainForumsId = {$in: forumsId};
  }
  if(tcId.length > 0) {
    match.tcId = {$in: tcId};
  }
  if(digest) {
    match.digest = true;
  }
  if(origin) {
    match.originStatus = {
      $in: ['4', '5', '6']
    };
  }
  let posts = await PostModel.aggregate([
    {
      $match: match
    },
    {
      $project: {
        pid: 1,
        tid: 1
      }
    },
    {
      $sample: {
        size: autoThreadCount
      }
    }
  ]);
  posts = posts || [];
  const threadsId = posts.map(post => post.tid);
  await this.updateOne({
    $set: {
      autoThreadsId: threadsId
    }
  });
}


module.exports = mongoose.model('homeBlocks', schema);