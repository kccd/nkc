
module.exports = async (ctx, next) => {
  const {db, data, query, nkcModules, state} = ctx;
  const {targetUser} = data;
  const {pageSettings} = state;
  const {page = 0, type, pid} = query;
  let q = {
    uid: targetUser.uid
  };
  // 获取总条数
  const count = await db.ThreadModel.countDocuments(q);
  if(type === 'get'){
    pageSettings.userCardThreadList = 10
  }
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardThreadList);
  if(type && type === 'search' && pid){
      q={
        oc:pid
      }
  }

  let threads = await db.ThreadModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  let postUrl=[]
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
  // 添加地址
  threads.forEach(item => {
    const url=  nkcModules.tools.getUrl('post', item.firstPost.pid)
    item.firstPost.url=url
    postUrl.push(url)
});
  data.threads = threads;
  await next();
};