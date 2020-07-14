module.exports = {
  _id: 'home',
  c: {
    ads: {
      movable: [], // 手动 轮播
      fixed: [], // 手动 固定
      fixedOrder: "random",
      movableOrder: "random",

      automaticFixed: {
        data: [],
        count: 0,
        proportion: 0,
        timeOfPost: { // 发表时间范围
          min: 1, // 最小时间
          max: 365 // 最大时间
        },
        digest: false, // 是否必须精选
        postVoteUpMinCount: 0, // 内容最小点赞数
        postVoteDownMaxCount: 99999, // 内容最大点踩数
        threadVoteUpMinCount: 0, // 内容+回复总体最小点赞数
        reportedAndUnReviewed: false, // 是否推送被举报且未被处理的文章
        original: false, // 是否必须为原创
        flowControl: false, // 是否推送收流量控制的文章
      },
      automaticMovable: {
        data: [],
        count: 0,
        proportion: 0,
        timeOfPost: { // 发表时间范围
          min: 1, // 最小时间
          max: 365 // 最大时间
        },
        digest: false, // 是否必须精选
        postVoteUpMinCount: 0, // 内容最小点赞数
        postVoteDownMaxCount: 99999, // 内容最大点踩数
        threadVoteUpMinCount: 0, // 内容+回复总体最小点赞数
        reportedAndUnReviewed: false, // 是否推送被举报且未被处理的文章
        original: false, // 是否必须为原创
        flowControl: false, // 是否推送收流量控制的文章
      },
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
    originalThreadDisplayMode: "simple"     // 首页上“最新原创”板块文章的显示方式， “simple” 简略显示， “full” 完整显示
  }
};
