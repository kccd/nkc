module.exports = async (ctx, next) => {
  //获取用户在专栏下发表的文章
  const {data, db, state, params, query, nkcModules, permission} = ctx;
  const {user, targetUser} = data;
  const {uid, column} = targetUser;
  const {page=0} = query;
  const {pageSettings} = state;
  const match = {
    columnId: column._id,
    hidden: false
  };
  const count = await db.ColumnPostModel.countDocuments(match);
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
  let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
    data.userRoles,
    data.userGrade,
    user
  );
  // 筛选出没有开启流控的专业
  let forumInReduceVisits = await db.ForumModel.find({openReduceVisits: true});
  forumInReduceVisits = forumInReduceVisits.map(forum => forum.fid);
  fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !forumInReduceVisits.includes(fid));
  const topicsId = await db.ForumModel.getForumsIdFromRedis("topic");
  const disciplinesId = await db.ForumModel.getForumsIdFromRedis("discipline");
  const homeSettings = await db.SettingModel.getSettings("home");
  
  // 排除话题下的文章
  if(!homeSettings.list || !homeSettings.list.topic) {
    fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !topicsId.includes(fid));
  }
  // 排除学科下的文章
  if(!homeSettings.list || !homeSettings.list.discipline) {
    fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !disciplinesId.includes(fid));
  }
  //获取访问的用户在专栏下的文章引用
  const columnPosts = await db.ColumnPostModel.find({columnId: column._id, hidden: false}, {pid: 1, columnId: 1}).skip(paging.start).limit(paging.perpage).sort({toc: -1});
  const tidArr = [];
  const pidArr = [];
  const aidArr = [];
  const {post, thread, article} = await db.ColumnPostModel.getColumnPostTypes();
  for(const c of columnPosts) {
    if(c.type === post) {
      pidArr.push(c.pid);
    } else if(c.type === thread) {
      tidArr.push(c.pid);
    } else if(c.type === article) {
      aidArr.push(c.pid);
    }
  }
  const q = {
    mainForumsId: {
      $in: fidOfCanGetThreads
    },
    recycleMark: {
      $ne: true
    },
    disabled: false,
    reviewed: true,
    inColumn: true,
    oc: {$in: tidArr}
  };
  //获取社区文章
  let columnThreads = await db.ThreadModel.find(q, {
    uid: 1, tid: 1, toc: 1, oc: 1, lm: 1,
    tlm: 1, fid: 1, hasCover: 1,
    mainForumsId: 1, hits: 1, count: 1,
    digest: 1, reviewed: 1,
    columnsId: 1,
    categoriesId: 1,
    disabled: 1, recycleMark: 1
  });
  columnThreads = await db.ThreadModel.extendThreads(columnThreads, {
    htmlToText: true,
    removeLink: true,
    forum,
    extendColumns: t === 'column'?true:false
  });
  let columnArticles = await db.ArticleModel.find({_id: {$in: aidArr}});
  columnArticles = await db.ColumnPostModel.extendColumnArticles(columnArticles);
  const articleObj = {};
  for(const ca of columnArticles) {
    articleObj[ca._id] = ca;
  }
  //拓展专栏引用下的文章
  data.paging = paging;
  await next();
};
