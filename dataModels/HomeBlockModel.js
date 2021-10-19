const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: Number,
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
  // 文章来源 auto: 自动, fixed: 固定, mixed: 混合
  fixedThreadCount: {
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
  }
}, {
  collection: 'homeBlocks'
});

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
    listStyle,
    coverPosition,
    threadCount,
    threadSource,
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
  if(!['abstract', 'brief', 'minimalist'].includes(listStyle)) {
    throwErr(400, `文章列表风格设置错误`);
  }
  if(!['left', 'right'].includes(coverPosition)) {
    throwErr(400, `文章封面图位置设置错误`);
  }
  checkNumber(threadCount, {
    name: '文章数目',
    min: 1
  });
  if(!['auto', 'fixed', 'mixed'].includes(threadSource)) {
    throwErr(400, `文章来源设置错误`);
  }
}

schema.statics.getHomeBlockData = async (props) => {
  const SettingModel = mongoose.model('settings');
  const ThreadModel = mongoose.model('threads');
  const ColumnModel = mongoose.model('columns');
  const HomeBlockModel = mongoose.model('homeBlocks');
  const {
    fidOfCanGetThreads = [],
  } = props;
  const {homeBlocksId, showShopGoods} = await SettingModel.getSettings('home');
  // 置顶专栏
  const defaultData = {
    toppedThreads: await ThreadModel.getHomeToppedThreads(fidOfCanGetThreads),
    toppedColumns: await ColumnModel.getHomeToppedColumns(),
    goods: [],
    forums: []
  };
  // 热销商品
  if(showShopGoods) {
    defaultData.goods = await db.ShopGoodsModel.getHomeGoods();
  }
  const homeBlockData = [];
  for(const id of homeBlocksId) {
    if(['toppedThreads', 'goods', 'toppedColumns', 'forums'].includes(id)) {
      homeBlockData.push({
        type: id,
        data: defaultData[id]
      });
      continue;
    }
    let data;
    const homeBlock = await HomeBlockModel.findOne({_id: id});
    if(!homeBlock) continue;
    const {
      autoThreadsId,
      fixedThreadsId,
      fixedThreadCount,
      threadCount,
    } = homeBlock;
    if(threadCount <= 0) {
      data = [];
    } else {

    }
  }
};

module.exports = mongoose.model('homeBlocks', schema);