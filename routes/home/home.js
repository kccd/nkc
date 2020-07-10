module.exports = async (options) => {
  const {ctx, fidOfCanGetThreads} = options;
  const {data, db, nkcModules} = ctx;
  const {user} = data;

  // 获取与用户有关的数据
  if(user) {
    const subForumsId = await db.SubscribeModel.getUserSubForumsId(user.uid);
    const forums = await db.ForumModel.find({fid: {$in: subForumsId}});
    const forumsObj = {};
    forums.map(f => forumsObj[f.fid] = f);
    data.subForums = [];
    // 查出此用户已关注的专业
    for(let fid of subForumsId) {
      const forum = forumsObj[fid];
      if(!forum) continue;
      // 查出3篇此专业的最新内容放进forum
      let posts = await db.PostModel.find({
        mainForumsId: {$in: [fid]},
        disabled: false,
        reviewed: true,
        toDraft: {$ne: true},
        type: "thread",
      }).sort({toc: -1}).limit(3);
      const threadsId = posts.map(post => post.tid);
      const threads = await db.ThreadModel.find({
        tid: {$in: threadsId},
        mainForumsId: {$in: [fid]}, disabled: false, reviewed: true, recycleMark: {$ne: true}
      }).sort({toc: -1});
      forum.latestThreads = await db.ThreadModel.extendThreads(threads, {
        lastPost: true,
        lastPostUser: true,
        category: true,
        forum: true,
        firstPost: true,
        firstPostUser: true,
        userInfo: false,
        firstPostResource: false,
        htmlToText: true
      });
      data.subForums.push(forum);
    }
  }

  const homeSettings = await db.SettingModel.getSettings("home");

  // 最新文章
  const threads = await db.ThreadModel.find({
    mainForumsId: {$in: fidOfCanGetThreads},
    disabled: false,
    recycleMark: {$ne: true},
    reviewed: true
  }).sort({toc: -1}).limit(10);
  data.threads = await db.ThreadModel.extendThreads(threads, {
    forum: true,
    category: false,
    firstPost: true,
    firstPostUser: true,
    userInfo: false,
    lastPost: false,
    lastPostUser: false,
    htmlToText: true,
    count: 200,
  });
  // 置顶文章轮播图
  data.ads = await db.ThreadModel.getAds(fidOfCanGetThreads);
  // 推荐专业
  data.recommendForums = await db.ForumModel.getRecommendForums(fidOfCanGetThreads);
  // 热门专栏
  data.columns = await db.ColumnModel.getToppedColumns();
  // 一周活跃用户
  data.activeUsers = await db.ActiveUserModel.getActiveUsersFromCache();
  // 热销商品
  data.showShopGoods = homeSettings.showShopGoods;
  data.goodsForums = await db.ForumModel.find({kindName: "shop"});
  data.goods = await db.ShopGoodsModel.getHomeGoods();
  // 首页置顶
  data.toppedThreads = await db.ThreadModel.getHomeToppedThreads(fidOfCanGetThreads);
  // 推荐 精选文章
  data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);
  // 最新文章
  // data.latestThreads = await db.ThreadModel.getLatestThreads(fidOfCanGetThreads, "toc", 3);
  // 最新原创文章
  data.originalThreads = await db.ThreadModel.getOriginalThreads(fidOfCanGetThreads);
  // 最新原创文章显示模式
  data.originalThreadDisplayMode = homeSettings.originalThreadDisplayMode;
  // 含有最新回复的文章
  data.latestPosts = await db.PostModel.getLatestPosts(fidOfCanGetThreads, 10);
  // 专业导航
  const forumsTree = await db.ForumModel.getForumsTreeLevel2(data.userRoles, data.userGrade, data.user);
  const forumsObj = {};
  forumsTree.map(f => {
    const {categoryId} = f;
    if(!forumsObj[categoryId]) forumsObj[categoryId] = [];
    forumsObj[categoryId].push(f);
  });
  data.categoryForums = [];

  ctx.state.forumCategories.map(fc => {
    const _fc = Object.assign({}, fc);
    const {_id} = _fc;
    _fc.forums = forumsObj[_id] || [];
    if(_fc.forums.length) data.categoryForums.push(_fc);
  });
  // 公告通知
  data.notices = await db.ThreadModel.getNotice(fidOfCanGetThreads);

  // 是否启用了基金
  const fundSettings = await db.SettingModel.findOne({_id: 'fund'});
  let enableFund = fundSettings.c.enableFund;
  if(enableFund) {
    // 基金名称
    data.fundName = fundSettings.c.fundName;
    // 基金申请
    const queryOfFunding = {
      disabled: false,
      'status.adminSupport': true,
      'status.completed': {$ne: true}
    };
    const funding = await db.FundApplicationFormModel.find(queryOfFunding).sort({toc: -1}).limit(5);
    data.fundApplicationForms = [];
    for(const a of funding) {
      await a.extendFund();
      if(a.fund) {
        await a.extendApplicant({
          extendSecretInfo: false
        });
        await a.extendProject();
        data.fundApplicationForms.push(a);
      }
    }
  }
  data.enableFund = enableFund;
  // 首页大Logo
  data.homeBigLogo = await db.AttachmentModel.getHomeBigLogo();
  // 浏览过的专业
  if(data.user) {
    const visitedForumsId = data.user.generalSettings.visitedForumsId.slice(0, 20);
    data.visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId);
  }
  await nkcModules.apiFunction.extendManagementInfo(ctx);

  ctx.template = "home/home_all.pug";
};
