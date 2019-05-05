const func = async (ctx) => {
  const {data, db, nkcModules, query} = ctx;
  const {user} = data;
  if(!user) return ctx.redirect("/");
  const {page=0} = query;
  let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
    data.userRoles,
    data.userGrade,
    data.user
  );
  const subs = await db.SubscribeModel.find({
    uid: user.uid
  }, {
    fid: 1,
    tid: 1,
    tUid: 1,
    type: 1
  }).sort({toc: -1});

  // 关注的专业ID，关注的用户ID，关注的文章ID
  const subFid = [], subUid = [], subTid = [];

  subs.map(s => {
    if(s.type === "forum") subFid.push(s.fid);
    if(s.type === "thread") subTid.push(s.tid);
    if(s.type === "user") subUid.push(s.tUid);
  });

  const q = {
    mainForumsId: {
      $in: fidOfCanGetThreads
    },
    recycleMark: {
      $ne: true
    },
    disabled: false,
    $or: [
      {
        fid: {
          $in: subFid
        }
      },
      {
        uid: user.uid
      },
      {
        uid: {
          $in: subUid
        }
      },
      {
        tid: {
          $in: subTid
        }
      }
    ]
  };

  const count = await db.ThreadModel.count(q);
  const paging = nkcModules.apiFunction.paging(page, count);

  let threads = await db.ThreadModel.find(q, {
    uid: 1, tid: 1, toc: 1, oc: 1, lm: 1,
    tlm: 1, fid: 1, hasCover: 1,
    mainForumsId: 1, hits: 1, count: 1
  }).skip(paging.start).limit(paging.perpage).sort({toc: -1});

  threads = await db.ThreadModel.extendThreads(threads, {
    htmlToText: true
  });
  threads.map(thread => {
    if(subTid.includes(thread.tid)) {
      thread.from = 'subThread';
    } else if(subUid.includes(thread.uid)) {
      thread.from = 'subFriend';
    } else if(thread.uid === user.uid) {
      thread.from = 'own';
    } else {
      thread.from = 'subForum';
    }
  });
  data.threads = threads;
  data.paging = paging;

};
module.exports = func;