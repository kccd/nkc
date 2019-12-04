module.exports = async (ctx, next) => {
  const {db, data, query, nkcModules, state} = ctx;
  const {targetUser} = data;
  const {pageSettings} = state;
  const {page = 0} = query;
  const q = {
    uid: targetUser.uid
  };
  const count = await db.ThreadModel.count(q);
  const paging = nkcModules.apiFunction.paging(page, count, pageSettings.userCardThreadList);
  let threads = await db.ThreadModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
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
  data.threads = threads;
  await next();
};