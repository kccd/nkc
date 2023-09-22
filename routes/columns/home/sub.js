module.exports = async function (ctx, next) {
  const { data, db, query, state, nkcModules } = ctx;
  const { page = 0 } = query;

  const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
    data.userRoles,
    data.userGrade,
    data.user,
  );

  let subColumnId = await db.SubscribeModel.getUserSubColumnsId(state.uid);
  const columns = await db.ColumnModel.find(
    {
      _id: { $in: subColumnId },
      disabled: false,
      closed: false,
    },
    {
      _id: 1,
      name: 1,
      avatar: 1,
    },
  );
  const columnsObj = {};
  subColumnId = [];
  for (const c of columns) {
    subColumnId.push(c._id);
    columnsObj[c._id] = c;
  }
  const match = {
    columnId: { $in: subColumnId },
    hidden: false,
  };
  const count = await db.ColumnPostModel.countDocuments(match);

  const pageSettings = await db.SettingModel.getSettings('page');

  const paging = nkcModules.apiFunction.paging(
    page,
    count,
    pageSettings.homeThreadList,
  );
  const subColumnPosts = await db.ColumnPostModel.find(match, {
    pid: 1,
    columnId: 1,
    type: 1,
  })
    .skip(paging.start)
    .limit(paging.perpage)
    .sort({ toc: -1 });

  const { thread: threadType, article: articleType } =
    await db.ColumnPostModel.getColumnPostTypes();

  const subColumnPostsId = [];
  const subColumnArticlesId = [];

  const columnPostsObj = {};
  const subColumnPostsObj = {};

  for (const sc of subColumnPosts) {
    if (sc.type === threadType) {
      subColumnPostsId.push(sc.pid);
    } else if (sc.type === articleType) {
      subColumnArticlesId.push(sc.pid);
    }
    columnPostsObj[sc.pid] = columnsObj[sc.columnId];
    subColumnPostsObj[sc.pid] = sc;
  }

  const extendPost = function (post) {
    const { pid, user, type, toc, title, content, cover } = post;

    const postType = type === 'post' ? '回复' : '文章';
    const column = columnPostsObj[pid];
    const columnPost = subColumnPostsObj[pid];
    // 关注的专栏
    return {
      toc,
      from: `添加${postType}`,
      type,
      user: {
        id: column._id,
        name: column.name,
        avatar: nkcModules.tools.getUrl('columnAvatar', column.avatar),
        homeUrl: nkcModules.tools.getUrl('columnHome', column._id),
      },
      quote: {
        user,
        title,
        content,
        cover,
        toc,
        url: nkcModules.tools.getUrl(
          'columnThread',
          columnPost.columnId,
          columnPost._id,
        ),
      },
    };
  };

  const postMatch = {
    mainForumsId: {
      $in: fidOfCanGetThreads,
    },
    recycleMark: {
      $ne: true,
    },
    disabled: false,
    reviewed: true,
    toDraft: { $ne: true },
    parentPostId: '',
    $or: [
      {
        pid: {
          $in: subColumnPostsId,
        },
      },
    ],
  };

  let posts = await db.PostModel.find(postMatch, {
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
  const postObj = {};
  const articleObj = {};
  for (const post of posts) {
    postObj[post.pid] = post;
  }
  const { normal: normalStatus } = await db.ArticleModel.getArticleStatus();
  let articles = await db.ArticleModel.find({
    _id: { $in: subColumnArticlesId },
    status: normalStatus,
  });
  articles = await db.ArticleModel.getArticlesInfo(articles);
  for (const article of articles) {
    articleObj[article._id] = article;
  }
  const activity = [];
  for (const sc of subColumnPosts) {
    let t;
    let thread;
    if (sc.type === threadType) {
      t = postObj[sc.pid];
      if (t) {
        thread = extendPost(t);
      }
    } else if (sc.type === articleType) {
      t = articleObj[sc.pid];
      if (t) {
        const { toc, user, document, url } = t;
        //获取当前引用的专栏信息
        const column = await sc.extendColumnPost();
        thread = {
          toc,
          form: '添加专栏文章',
          type: 'article',
          user: {
            id: column._id,
            name: column.name,
            avatar: nkcModules.tools.getUrl('columnAvatar', column.avatar),
            homeUrl: nkcModules.tools.getUrl('columnHome', column._id),
          },
          quote: {
            user: {
              uid: user.uid,
              avatar: nkcModules.tools.getUrl('userAvatar', user.avatar),
              username: user.username,
              banned: user.certs.includes('banned'),
              homeUrl: nkcModules.tools.getUrl('userHome', user.uid),
              name: user.username,
              id: user.uid,
            },
            title: document.title,
            content: nkcModules.nkcRender.htmlToPlain(document.content, 200),
            cover: nkcModules.tools.getUrl('postCover', document.cover),
            toc: document.toc,
            url,
          },
        };
      }
    }
    if (thread) {
      activity.push(thread);
    }
  }
  data.activity = activity;
  data.paging = paging;
  await next();
};
