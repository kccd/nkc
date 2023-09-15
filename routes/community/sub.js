const Router = require('koa-router');
const router = new Router();
const { OnlyUser } = require('../../middlewares/permission');
const apiFunction = require('../../nkcModules/apiFunction');
const { getUrl } = require('../../nkcModules/tools');
router.get('/', OnlyUser(), async (ctx, next) => {
  const { data, db, query } = ctx;
  const { page = 0 } = query;
  const pageSettings = await db.SettingModel.getSettings('page');
  let subForumsId = await db.SubscribeModel.getUserSubForumsId(data.user.uid);
  const readableForumsId = await db.ForumModel.getReadableForumsIdByUid(
    data.user.uid,
  );
  const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
    data.userRoles,
    data.userGrade,
    data.user,
  );
  subForumsId = subForumsId
    .filter((fid) => readableForumsId.includes(fid))
    .filter((fid) => fidOfCanGetThreads.includes(fid));
  const forums = await db.ForumModel.getForumsByIdFromRedis(subForumsId);
  const forumsObj = {};
  for (const f of forums) {
    forumsObj[f.fid] = f;
  }
  const match = {
    mainForumsId: {
      $in: subForumsId,
    },
    recycleMark: {
      $ne: true,
    },
    disabled: false,
    reviewed: true,
    toDraft: { $ne: true },
    parentPostId: '',
    type: 'thread',
  };
  const count = await db.PostModel.countDocuments(match);
  const paging = apiFunction.paging(page, count, pageSettings.homeThreadList);
  let posts = await db.PostModel.find(match, {
    pid: 1,
    tid: 1,
    uid: 1,
    toc: 1,
    type: 1,
    c: 1,
    t: 1,
    anonymous: 1,
    cover: 1,
    mainForumsId: 1,
    columnsId: 1,
  })
    .sort({ toc: -1 })
    .skip(paging.start)
    .limit(paging.perpage);
  posts = await db.PostModel.extendActivityPosts(posts);

  const extendPost = function (post) {
    const { user, type, toc, url, title, content, cover, forumsId, quote } =
      post;

    if (user.uid !== null) {
      user.homeUrl = getUrl('userHome', user.uid);
    }
    user.name = user.username;
    user.id = user.uid;
    user.dataFloatUid = user.uid;
    if (quote !== null) {
      if (quote.user.uid !== null) {
        quote.user.homeUrl = getUrl('userHome', quote.user.uid);
      }
      quote.user.id = quote.user.uid;
      quote.user.name = quote.user.username;
      quote.user.dataFloatUid = quote.user.uid;
    }

    let a;
    let postType = type === 'post' ? '回复' : '文章';
    // 关注的专业
    let forum;
    for (const fid of forumsId) {
      const _forum = forumsObj[fid];
      if (_forum) {
        forum = _forum;
        break;
      }
    }
    if (!forum) {
      return;
    }
    a = {
      toc,
      from: `添加${postType}`,
      user: {
        id: forum.fid,
        name: forum.displayName,
        avatar: forum.logo ? getUrl('forumLogo', forum.logo) : null,
        homeUrl: getUrl('forumHome', forum.fid),
        color: forum.color,
        dataFloatFid: forum.fid,
      },
      quote: {
        user,
        title,
        content,
        cover,
        toc,
        url,
      },
    };
    return a;
  };
  const activity = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const a = extendPost(post);
    activity.push(a);
  }
  data.paging = paging;
  data.activity = activity;
  ctx.template = 'community/sub/sub.pug';
  await next();
});
module.exports = router;
