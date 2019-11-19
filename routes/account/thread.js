module.exports = async (ctx, next) => {
  const {db, data, query, nkcModules} = ctx;
  const {user} = data;
  const {page = 0} = query;
  const q = {
    uid: user.uid
  };
  const count = await db.ThreadModel.count(q);
  const paging = nkcModules.apiFunction.paging(page, count);
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
  data.paging = {
    pageCount: 23,
    page: 3
  };
  await next();
};