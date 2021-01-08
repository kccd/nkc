const router = require('koa-router')();
const PATH = require('path');
router
  .get('/', async (ctx, next) => {
    const {data, db, query, params, state, nkcModules} = ctx;
    const {page = 0} = query;
    const {pid} = params;
    const post = await db.PostModel.findOnly({pid});
    const {uid, pageSettings} = state;
    const {threadPostCommentList} = pageSettings;
    const isModerator = await db.PostModel.isModerator(uid, pid);
    const q = {
      parentPostId: pid,
    };
    // 判断是否有权限查看未审核的post
    if(data.user) {
      if(!isModerator) {
        q.$and = [
          {
            $or: [
              {
                reviewed: true
              },
              {
                reviewed: false,
                uid
              }
            ]
          },
          {
            $or: [
              {
                disabled: false,
                toDraft: {$ne: true},
              },
              {
                toDraft: true,
                uid
              }
            ]
          }
        ];
      }
    } else {
      q.reviewed = true;
      q.disabled = false;
      q.toDraft = null;
    }
    const count = await db.PostModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count, threadPostCommentList);
    let parentPosts = await db.PostModel.find(q).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
    const parentPostsId = []
    for(const parentPost of parentPosts) {
      parentPostsId.push(parentPost.pid);
    }
    delete q.parentPostId;
    q.parentPostsId = {$in: parentPostsId};
    let childPosts = await db.PostModel.find(q).sort({toc: 1});
    let posts = childPosts.concat(parentPosts);
    const extendPostOptions = {
      uid,
      visitor: data.user,
      toDraftReason: true,
    };
    posts = await db.PostModel.extendPosts(posts, extendPostOptions);
    const comments = await db.PostModel.filterCommentsInfo(posts);
    data.postPermission = await db.UserModel.getPostPermission(state.uid, 'post');
    data.tid = post.tid;
    data.pid = post.pid
    data.paging = paging;
    data.htmlContent = await nkcModules.render(
      PATH.resolve(__dirname, `../../pages/thread/singleComment/singleComments.pug`),
      {...data, comments},
      state
    )
    await next();
  });
module.exports = router;
