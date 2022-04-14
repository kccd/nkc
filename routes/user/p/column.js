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
  //获取社区文章
  // const columnThreads = await db.ThreadModel.find({});
  //拓展专栏引用下的文章
  data.paging = paging;
  await next();
};
