module.exports = async (ctx, next) => {
  const {db, data, query, nkcModules, state} = ctx;
  const {targetUser} = data;
  const {pageSettings} = state;
  const {page = 0, type, pid} = query;
  console.log(query,targetUser,pageSettings)
  let q = {
    uid: targetUser.uid
  };
  // 获取总条数
  const count = await db.ThreadModel.countDocuments(q);
  // 一些配置信息 比如当前第几页 开始条数等等
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardThreadList);
  console.log(paging,'paging')
  if(type){
    paging.perpage=10
    if(type === 'search' && pid){
      q={
        oc:pid
      }
    }
  }
  let threads = await db.ThreadModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  // console.log(threads,'threads')
  data.paging = paging;
  threads = await db.ThreadModel.extendThreads(threads, {
    forum: true,
    category: false,
    firstPost: true,
    firstPostUser: false,
    userInfo: false,
    lastPost: false,
    lastPostUser: false,
    firstPostResource: false,
    htmlToText: true,
    count: 200,
    showAnonymousUser: true,
    excludeAnonymousPost: false,
  });
  console.log(threads,'threads')
  data.threads = threads;
  await next();
};