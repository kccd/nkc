const Router = require('koa-router');

const router = new Router();

router
  .get('/', async(ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    const {page = 0} = query;
    const gradeId = data.userGrade._id;
    const rolesId = data.userRoles.map(r => r._id);
    const options = {
      gradeId,
      rolesId,
      uid: data.user?data.user.uid:''
    };
    const fidOfCanGetThreads = await db.ForumModel.fidOfCanGetThreads(options);
    const q = {
      recycleMark: {$ne: true},
      fid: {$in: fidOfCanGetThreads}
    };
    const threadCount = await db.ThreadModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, threadCount);
    data.paging = paging;
    // 加载文章
    const threads = await db.ThreadModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const results = [];
    for(const thread of threads) {
      const firstPost = await thread.extendFirstPost();
      const firstPostUser = await firstPost.extendUser();
      const lastPost = await thread.extendLastPost();
      const lastPostUser = await lastPost.extendUser();
      const forum = await thread.extendForum();
      const parentForum = forum.extendParentForum();
      results.push({
        tid: thread.tid,
        firstPost: {
          t: firstPost.t,
          c: firstPost.c,
          toc: firstPost.toc,
          user: {
            username: firstPostUser.username,
            uid: firstPostUser.uid
          }
        },
        lastPost: {
          c: lastPost.c,
          user: {
            username: lastPostUser.username,
            uid: lastPostUser.uid
          }
        },
        forum: {
          displayName: forum.displayName,
          fid: forum.fid,
          color: forum.color,
          parentForum: {
            displayName: parentForum.displayName,
            fid: parentForum.fid,
            color: parentForum.color
          }
        }
      })
    }
    const ads = [];
    data.homeSettings = await db.SettingModel.findOnly({type: 'home'});
    for(const tid of data.homeSettings.ads) {
      const thread = await db.ThreadModel.findOne({tid});
      if(thread && fidOfCanGetThreads.includes(thread.fid)) {
        await thread.extendFirstPost().then(p => p.extendUser());
        ads.push({
          tid: thread.tid,
          firstPost: {
            t: thread.firstPost.t
          }
        });
      }
    }
    data.ads = ads;
    data.threads = results;
    await next();
  });

module.exports = router;