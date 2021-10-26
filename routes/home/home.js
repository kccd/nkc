module.exports = async (options) => {
  const {ctx, fidOfCanGetThreads} = options;
  const {data, db, nkcModules, state} = ctx;
  const {user} = data;

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
    removeLink: true,
  });
  // 置顶文章轮播图
  data.ads = await db.ThreadModel.getHomeRecommendThreads(fidOfCanGetThreads);
  // 推荐专业
  // data.recommendForums = await db.ForumModel.getRecommendForums(fidOfCanGetThreads);
  // 热门专栏
  if(['main', 'side'].includes(homeSettings.columnListPosition)) {
    data.columns = await db.ColumnModel.getHomeHotColumns();
  } else {
    data.columns = [];
  }

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

  // 置顶专栏
  // data.toppedColumns = await db.ColumnModel.getHomeToppedColumns();
  // 热销商品
  // data.showShopGoods = homeSettings.showShopGoods;
  data.goodsForums = await db.ForumModel.find({kindName: "shop"});
  // data.goods = await db.ShopGoodsModel.getHomeGoods();
  // 最新原创文章显示模式
  data.originalThreadDisplayMode = homeSettings.originalThreadDisplayMode;
  data.columnListPosition = homeSettings.columnListPosition;
  // 首页置顶
  // data.toppedThreads = await db.ThreadModel.getHomeToppedThreads(fidOfCanGetThreads);
  // 浏览过的专业
  /*if(data.user) {
    const visitedForumsId = data.user.generalSettings.visitedForumsId.slice(0, 5);
    data.visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId);
  }*/
  // 是否有权限开办专业
  data.hasPermissionOpenNewForum = await db.PreparationForumModel.hasPermissionToCreatePForum(state.uid);
  
  // 是否需要进行手机号验证
  data.needVerifyPhoneNumber = await db.UsersPersonalModel.shouldVerifyPhoneNumber(state.uid);

  data.homeBlockData = await db.HomeBlockModel.getHomeBlockData({
    fidOfCanGetThreads,
    showDisabledBlock: ctx.permission('nkcManagementHome')
  });
  // 多维分类
  data.threadCategories = await db.ThreadCategoryModel.getCategoryTree({disabled: false});
  ctx.template = "home/home_all.pug";
};
