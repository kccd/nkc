const Router = require('koa-router');
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      user
    );
    // 置顶文章轮播图
    data.ads = await db.ThreadModel.getAds(fidOfCanGetThreads);
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
    data.columns = await db.ColumnModel.find({closed: false, disabled: false}).sort({subCount:-1}).limit(7);
    // 一周活跃用户
    data.activeUsers = await db.ActiveUserModel.getActiveUsersFromCache();
    // 热销商品
    const goods = await db.ShopGoodsModel.find({disabled: false}).limit(7);
    const threadsId = goods.map(g => g.tid);
    let goodsThreads = await db.ThreadModel.find({tid: {$in: threadsId}});
    goodsThreads = await db.ThreadModel.extendThreads(goodsThreads, {
      forum: false,
      lastPost: false,
      lastPostUser: false,
      category: false
    });
    const goodsThreadsObj = {};
    goodsThreads.map(t => goodsThreadsObj[t.tid] = t);
    data.goods = [];
    for(let g of goods) {
      const thread = goodsThreadsObj[g.tid];
      if(thread) {
        g = g.toObject();
        g.thread = thread;
        data.goods.push(g);
      }
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
