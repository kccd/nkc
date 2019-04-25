// 最新 已登录和游客都可用
const func = async (ctx) => {
  const {data, db, nkcModules, query} = ctx;
  const {user} = data;
  const {page = 0} = query;
  let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
    data.userRoles,
    data.userGrade,
    user
  );
  const q = {
    mainForumsId: {
      $in: fidOfCanGetThreads
    },
    recycleMark: {
      $ne: true
    },
    disabled: false
  };
  const count = await db.ThreadModel.count(q);
  const paging = nkcModules.apiFunction.paging(page, count);
  let threads = await db.ThreadModel.find(q, {
    uid: 1, tid: 1, toc: 1, oc: 1, lm: 1,
    tlm: 1, fid: 1, hasCover: 1,
    mainForumsId: 1, hits: 1, count: 1
  }).skip(paging.start).limit(paging.perpage).sort({toc: -1});

  data.threads = await db.ThreadModel.extendThreads(threads, {
    htmlToText: true
  });
  data.paging = paging;
};
module.exports = func;