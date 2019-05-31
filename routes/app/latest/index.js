const Router = require('koa-router');

const router = new Router();

router
  .get('/', async(ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    const {page = 0} = query;

    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user);
    const q = {
      reviewed: true,
      recycleMark: {$ne: true},
      mainForumsId: {$in: fidOfCanGetThreads}
    };
    const threadCount = await db.ThreadModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, threadCount);
    data.paging = paging;
    // 加载文章
    const threads = await db.ThreadModel.find(q).sort({tlm: -1}).skip(paging.start).limit(paging.perpage);
    const results = [];
    for(const thread of threads) {
      const firstPost = await thread.extendFirstPost();
      const firstPostUser = await firstPost.extendUser();
      const lastPost = await thread.extendLastPost();
      const lastPostUser = await lastPost.extendUser();
      const forum = await thread.extendForums(['mainForums']);
      // let parentForum = await forum.extendParentForums();
      let firstPostContent = nkcModules.APP_nkc_render.experimental_render(firstPost);
      firstPostContent = firstPostContent.replace(/<.*?>/ig, '');
      firstPostContent = unescape(firstPostContent.replace(/&#x/g,'%u').replace(/;/g,'').replace(/%uA0/g,' '));

      let lastPostContent = nkcModules.APP_nkc_render.experimental_render(lastPost);
      lastPostContent = lastPostContent.replace(/<.*?>/ig, '');
      lastPostContent = unescape(lastPostContent.replace(/&#x/g,'%u').replace(/;/g,'').replace(/%uA0/g,' '));
      // if(parentForum) {
      //   parentForum = {
      //     displayName: parentForum.displayName,
      //       fid: parentForum.fid,
      //       color: parentForum.color
      //   };
      // }
      results.push({
        hasCover: thread.hasCover,
        tid: thread.tid,
        hits: thread.hits,
        count: thread.count,
        firstPost: {
          t: firstPost.t,
          c: firstPostContent,
          toc: firstPost.toc,
          user: {
            username: firstPostUser.username,
            uid: firstPostUser.uid
          }
        },
        lastPost: {
          c: lastPostContent,
          toc: lastPost.toc,
          user: {
            username: lastPostUser.username,
            uid: lastPostUser.uid
          }
        },
        forum: {
          displayName: forum[0].displayName,
          fid: forum[0].fid,
          color: forum[0].color,
          // parentForum: parentForum
        }
      })
    }
    const ads = [];
    data.homeSettings = (await db.SettingModel.findOnly({_id: 'home'})).c;
    for(const tid of data.homeSettings.ads) {
      const thread = await db.ThreadModel.findOne({tid});
      for(let f of thread.mainForumsId){
        if(thread && fidOfCanGetThreads.includes(f)) {
          await thread.extendFirstPost().then(p => p.extendUser());
          ads.push({
            tid: thread.tid,
            firstPost: {
              t: thread.firstPost.t
            }
          });
          break;
        }
      }
      // if(thread && fidOfCanGetThreads.includes(thread.fid)) {
      //   await thread.extendFirstPost().then(p => p.extendUser());
      //   ads.push({
      //     tid: thread.tid,
      //     firstPost: {
      //       t: thread.firstPost.t
      //     }
      //   });
      // }
    }
    data.ads = ads;
    data.threads = results;
    await next();
  });

module.exports = router;