module.exports = {
  _id: 'home',
  c: {
    recommendThreads: {
      fixed: {
        order: 'random', // 文章显示顺序， random: 随机, fixed: 顺序
        manuallySelectedThreads: [], // 手动推荐的文章
        automaticallySelectedThreads: [], // 自动推荐的文章
        displayType: 'manual', // manual: 手动, automatic: 自动, all: 混合
        automaticProportion: 1, // 当现实方式为「混合」时，自动推荐的文章所占的比例
        automaticCount: 20, // 自动选择推荐文章的数量
        timeOfPost: { // 文章的发表时间限制
          min: 0, // 距离当前最短一天
          max: 365 // 距离当前最长365天
        },
        countOfPost: {
          min: 0,
          max: 30
        },
        timeInterval: 1, // 自动更新的间隔时间（小时）
        digest: false, // 文章是否必须是精选
        postVoteUpMinCount: 0, // 文章的最小点赞数
        postVoteDownMaxCount: 99999, // 文章的最大点踩数
        threadVoteUpMinCount: 0, // 文章（包含所有回复）的最小点赞数
        reportedAndUnReviewed: false, // 是否包含被举报且未处理的文章
        original: false, // 文章是否必须为原创
        flowControl: false, // 是否包含流控文章
      },
      movable: {
        order: 'random', // 文章显示顺序， random: 随机, fixed: 顺序
        manuallySelectedThreads: [], // 手动推荐的文章
        automaticallySelectedThreads: [], // 自动推荐的文章
        displayType: 'manual', // manual: 手动, automatic: 自动, all: 混合
        automaticProportion: 1, // 当现实方式为「混合」时，自动推荐的文章所占的比例
        automaticCount: 20, // 自动选择推荐文章的数量
        timeOfPost: { // 文章的发表时间限制
          min: 0, // 距离当前最短一天
          max: 365 // 距离当前最长365天
        },
        countOfPost: {
          min: 0,
          max: 30
        },
        timeInterval: 1, // 自动更新的间隔时间（小时）
        digest: false, // 文章是否必须是精选
        postVoteUpMinCount: 0, // 文章的最小点赞数
        postVoteDownMaxCount: 99999, // 文章的最大点踩数
        threadVoteUpMinCount: 0, // 文章（包含所有回复）的最小点赞数
        reportedAndUnReviewed: false, // 是否包含被举报且未处理的文章
        original: false, // 文章是否必须为原创
        flowControl: false, // 是否包含流控文章
      }
    },
    ads: {
      movable: [], // 手动 轮播
      fixed: [], // 手动 固定
      fixedOrder: "random",
      movableOrder: "random",
    },
    toppedThreadsId: [],
    recommendForumsId: [],
    showShopGoods: true,    // 是否显示热销商品板块，默认显示，可以在前台设置中修改
    shopGoodsId: [],
    columnsId: [],
    logos: [],
    logo: "",
    smallLogo: "",
    homeBigLogo: [],
    noticeThreadsId: [],
    list: {
      topic: true,
      discipline: true
    },
    watermarkTransparency: 30,
    waterLimit: {
      minWidth: 799,
      minHeight: 479
    },
    // 游客默认显示 推荐、最新
    visitorThreadList: "recommend",
    // 热门文章 条件
    hotThreads: {
      postCount: 50,
      postUserCount: 20
    },
    recommend: {
      featuredThreads: true, // 精选文章
      hotThreads: true, // 热门文章
      voteUpTotal: 20, // 总点赞数
      voteUpMax: 10, // 最高点赞数
      encourageTotal: 10 // 总鼓励数
    },
    originalThreadDisplayMode: "simple",     // 首页上“最新原创”板块文章的显示方式， “simple” 简略显示， “full” 完整显示
    subscribesDisplayMode: "row",            // 首页上“关注的专业”板块的显示方式，  “row” 横排， “column” 竖排
  }
};
