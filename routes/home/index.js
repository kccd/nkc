const Router = require('koa-router');
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, data, db} = ctx;
    const {user} = data;
    const today = nkcModules.apiFunction.today();
    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      user
    );
    // 置顶文章轮播图
    data.ads = await db.ThreadModel.getAds(fidOfCanGetThreads);
    data.ads.fixed = data.ads.fixed.slice(0, 6);
    // 推荐专业
    data.recommendForums = await db.ForumModel.getRecommendForums(fidOfCanGetThreads);
    // 获取与用户有关的数据
    if(user) {
      const subForumsId = await db.SubscribeModel.getUserSubForumsId(user.uid);
      const forums = await db.ForumModel.find({fid: {$in: subForumsId}});
      const forumsObj = {};
      forums.map(f => forumsObj[f.fid] = f);
      data.subForums = [];
      for(let fid of subForumsId) {
        const forum = forumsObj[fid];
        if(!forum) continue;
        data.subForums.push(forum);
      }
    }
    
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
    // 推荐专栏
    data.columns = await db.ColumnModel.getToppedColumns();
    // 一周活跃用户
    data.activeUsers = await db.ActiveUserModel.getActiveUsersFromCache();
    // 热销商品
    data.goodsForums = await db.ForumModel.find({kindName: "shop"});
    data.goods = await db.ShopGoodsModel.getHomeGoods();
    // 基金
    // 推荐 精选文章
    // data.recommendThreads = await db.ThreadModel.getRecommendThreads(fidOfCanGetThreads);
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);
    // 专业导航
    data.forumsTree = await db.ForumModel.getForumsTreeLevel2(data.userRoles, data.userGrade, data.user);
    // 浏览过的专业
    const visitedForumLogs = await db.UsersBehaviorModel.find({timeStamp: {$gte: Date.now() - 7 * 24 * 60 * 60 * 1000},
      operationId: "visitForumLatest"});
    let visitedForumsId = visitedForumLogs.map(l => l.fid);
    visitedForumsId = [...new Set(visitedForumsId)].slice(0, 10);
    const visitedForums = await db.ForumModel.find({fid: {$in: visitedForumsId}});
    const visitedForumsObj = {};
    visitedForums.map(forum => visitedForumsObj[forum.fid] = forum);
    data.visitedForums = [];
    for(const fid of visitedForumsId) {
      const forum = visitedForumsObj[fid];
      if(forum) data.visitedForums.push(forum);
    }
    
    // 管理操作
    if(ctx.permission("complaintGet")) {
      data.unResolvedComplaintCount = await db.ComplaintModel.count({resolved: false});
    }
    if(ctx.permission("visitProblemList")) {
      data.unResolvedProblemCount = await db.ProblemModel.count({resolved: false});
    }
    if(ctx.permission("review")) {
      const q = {
        reviewed: false,
        disabled: false,
        mainForumsId: {$ne: "recycle"}
      };
      if(!ctx.permission("superModerator")) {
        const forums = await db.ForumModel.find({moderators: data.user.uid}, {fid: 1});
        const fid = forums.map(f => f.fid);
        q.mainForumsId = {
          $in: fid
        }
      }
      const posts = await db.PostModel.find(q, {tid: 1, pid: 1});
      const threads = await db.ThreadModel.find({tid: {$in: posts.map(post => post.tid)}}, {recycleMark: 1, oc: 1, tid: 1});
      const threadsObj = {};
      threads.map(thread => threadsObj[thread.tid] = thread);
      let count = 0;
      posts.map(post => {
        const thread = threadsObj[post.tid];
        if(thread && (thread.oc !== post.pid || !thread.recycleMark)) {
          count++;
        }
      });
      data.unReviewedCount = count;
    }
    
    ctx.template = "home/home_all.pug";
    await next();
  });
module.exports = router;
