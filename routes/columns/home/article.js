const { getUrl } = require('../../../nkcModules/tools');
module.exports = async function (ctx, next) {
  //获取最新专栏文章列表信息
  const { db, data, query, nkcModules, state, permission } = ctx;
  const { user } = data;
  const { page = 0 } = query;

  const { homePageTypes } = data;

  const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
    data.userRoles,
    data.userGrade,
    data.user,
  );

  const permissions = {
    reviewed: null,
  };

  const {
    normal: normalStatus,
    disabled: disabledStatus,
    faulty: faultyStatus,
    unknown: unknownStatus,
  } = await db.ArticleModel.getArticleStatus();

  //获取专栏引用类型
  const { thread: threadType, article: articleType } =
    await db.ColumnPostModel.getColumnPostTypes();

  const tidArr = [];
  const aidArr = [];

  const pageSettings = await db.SettingModel.getSettings('page');

  const postMatch = {
    type: {
      $in: [threadType, articleType],
    },
    hidden: false,
  };
  if (data.t === homePageTypes.sub) {
    const subColumnsId = await db.SubscribeModel.getUserSubColumnsId(state.uid);
    postMatch.columnId = {
      $in: subColumnsId,
    };
  }

  const count = await db.ColumnPostModel.countDocuments(postMatch);
  const paging = nkcModules.apiFunction.paging(
    page,
    count,
    pageSettings.homeThreadList,
  );

  const columnPosts = await db.ColumnPostModel.find(postMatch)
    .skip(paging.start)
    .limit(paging.perpage)
    .sort({ toc: -1 });
  const columnPostCategoriesId = [];
  const columnPostsObj = {};
  const columnsId = [];
  for (const c of columnPosts) {
    columnPostsObj[c.pid] = c;
    if (c.type === threadType) {
      tidArr.push(c.pid);
    } else if (c.type === articleType) {
      aidArr.push(c.pid);
    }
    columnPostCategoriesId.push(...c.cid);
    columnsId.push(c.columnId);
  }
  const columns = await db.ColumnModel.find(
    {
      _id: {
        $in: columnsId,
      },
    },
    {
      _id: 1,
      name: 1,
      avatar: 1,
    },
  );
  const columnsObj = {};
  for (const column of columns) {
    columnsObj[column._id] = {
      uid: '',
      avatarUrl: getUrl('columnAvatar', column.avatar),
      homeUrl: getUrl('columnHome', column._id),
      username: column.name,
    };
  }
  const columnPostCategoriesObj = {};
  const categories = await db.ColumnPostCategoryModel.find(
    {
      _id: {
        $in: columnPostCategoriesId,
      },
    },
    {
      name: 1,
      _id: 1,
      columnId: 1,
    },
  );
  for (const category of categories) {
    columnPostCategoriesObj[category._id] = {
      id: category._id,
      type: 'columnCategory',
      name: category.name,
      url: getUrl('columnCategory', category.columnId, category._id),
    };
  }
  const q = {
    oc: { $in: tidArr },
    mainForumsId: {
      $in: fidOfCanGetThreads,
    },
  };
  const match = {
    _id: { $in: aidArr },
    $or: [
      {
        status: normalStatus,
      },
    ],
  };
  let canManageFid = [];
  if (user) {
    if (permission('movePostsToRecycle') || permission('movePostsToDraft')) {
      permissions.reviewed = true;
    }
    canManageFid = await db.ForumModel.canManagerFid(
      data.userRoles,
      data.userGrade,
      data.user,
    );
    if (!ctx.permission('superModerator')) {
      q.$or = [
        {
          reviewed: true,
        },
        {
          reviewed: false,
          mainForumsId: {
            $in: canManageFid,
          },
        },
      ];
    }
    match.$or.push({
      uid: state.uid,
      status: {
        $in: [normalStatus, faultyStatus, disabledStatus, unknownStatus],
      },
    });
  } else {
    q.reviewed = true;
  }
  //查找出最新专栏下的社区文章
  let columnThreads = await db.ThreadModel.find(q, {
    uid: 1,
    tid: 1,
    toc: 1,
    oc: 1,
    lm: 1,
    tlm: 1,
    fid: 1,
    hasCover: 1,
    mainForumsId: 1,
    hits: 1,
    count: 1,
    digest: 1,
    reviewed: 1,
    columnsId: 1,
    categoriesId: 1,
    disabled: 1,
    recycleMark: 1,
  });
  const superModerator = ctx.permission('superModerator');
  columnThreads = columnThreads.filter((thread) => {
    if (thread.disabled || thread.recycleMark) {
      if (!user) {
        return false;
      }
      if (!superModerator) {
        let isModerator = false;
        const mainForumsId = thread.mainForumsId;
        for (const fid of mainForumsId) {
          if (canManageFid.includes(fid)) {
            isModerator = true;
            break;
          }
        }
        if (!isModerator) {
          return false;
        }
      }
    }
    return true;
  });
  columnThreads = await db.ThreadModel.extendArticlesPanelData(columnThreads);

  const threadObj = {};
  for (const thread of columnThreads) {
    const columnPost = columnPostsObj[thread.oc];
    if (columnPostsObj) {
      thread.content.url = nkcModules.tools.getUrl(
        'columnThread',
        columnPost.columnId,
        columnPost._id,
      );
      threadObj[columnPost.pid] = thread;
    }
  }
  //查找最新专栏文章的独立文章
  let columnArticles = await db.ArticleModel.find(match);
  //拓展独立文章
  columnArticles = await db.ArticleModel.extendArticlesPanelData(
    columnArticles,
  );
  const articleObj = {};
  for (const ca of columnArticles) {
    articleObj[ca.id] = ca;
  }
  const threads = [];
  for (const c of columnPosts) {
    let thread;
    if (c.type === threadType) {
      thread = threadObj[c.pid];
    } else if (c.type === articleType) {
      thread = articleObj[c.pid];
    }
    if (thread) {
      const categories = [];
      for (const cid of c.cid) {
        const category = columnPostCategoriesObj[cid];
        if (category) {
          categories.push(category);
          break;
        }
      }
      thread.categories = categories;
      thread.user = columnsObj[c.columnId];
      threads.push(thread);
    }
  }
  data.permissions = permissions;
  data.latestColumnArticlePanelStyle =
    pageSettings.articlePanelStyle.latestColumn;
  data.articlesPanelData = threads;
  data.paging = paging;
  await next();
};
