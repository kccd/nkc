const router = require('koa-router')();
const nkcRender = require('../../nkcModules/nkcRender');
const { renderHTMLByJSON } = require('../../nkcModules/nkcRender/json');
const { OnlyOperation } = require('../../middlewares/permission');
const { userInfoService } = require('../../services/user/userInfo.service');
const { Operations } = require('../../settings/operations');
router.get(
  '/',
  OnlyOperation(Operations.nkcManagementPost),
  async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    let {
      page = 0,
      perPage = 50,
      timeStart,
      timeStop = Date.now(),
      source = ['thread', 'post', 'comment'].join(','),
      text = '',
      order = 'desc',
    } = query;
    text = text.trim();
    page = parseInt(page);
    if (isNaN(page) || page < 0) {
      page = 0;
    }
    perPage = parseInt(perPage);
    if (isNaN(perPage) || perPage < 1) {
      perPage = 50;
    }
    const sourceArr = source ? source.split(',') : [];
    const match = {
      toc: {
        $lte: new Date(Number(timeStop)),
        $gte: timeStart ? new Date(Number(timeStart)) : new Date(0),
      },
    };
    const sourceOr = [];
    // 数据来源
    if (sourceArr.includes('thread')) {
      sourceOr.push({
        type: 'thread',
      });
    }
    if (sourceArr.includes('post')) {
      sourceOr.push({
        type: 'post',
        parentPostId: '',
      });
    }
    if (sourceArr.includes('comment')) {
      sourceOr.push({
        type: 'post',
        parentPostId: { $ne: '' },
      });
    }
    match.$and = [
      {
        $or: sourceOr,
      },
    ];
    // 关键词
    if (text) {
      const textOr = [];
      textOr.push({
        uid: text,
      });
      textOr.push({
        pid: text,
      });
      textOr.push({
        tid: text,
      });
      match.$and.push({
        $or: textOr,
      });
    }

    const recycleId = await db.SettingModel.getRecycleId();

    const count = await db.PostModel.countDocuments(match);
    console.log('Count of posts matching criteria:', count);
    console.log('Match criteria:', JSON.stringify(match));
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      parseInt(perPage),
    );
    let posts = await db.PostModel.find(match)
      .sort({ toc: order === 'desc' ? -1 : 1 })
      .skip(paging.start)
      .limit(paging.perpage);
    posts = await db.PostModel.extendPosts(posts, {
      visitor: { xsf: 9999 },
      renderHTML: true,
      user: true,
      resource: true,
      showAnonymousUser: true,
      url: true,
    });

    const forums = await db.ForumModel.find({}, { displayName: 1, fid: 1 });
    const forumsObj = {};
    forums.map((forum) => (forumsObj[forum.fid] = forum));

    const results = [];

    const threadsId = [];

    for (const post of posts) {
      if (post.type === 'thread') {
        continue;
      }
      threadsId.push(post.tid);
    }
    const threads = await db.ThreadModel.find(
      { tid: { $in: threadsId } },
      { tid: 1, oc: 1 },
    );
    const threadPosts = await db.PostModel.find(
      { pid: { $in: threads.map((thread) => thread.oc) } },
      { tid: 1, t: 1 },
    );
    const threadsObj = {};
    for (const tp of threadPosts) {
      const { tid, t } = tp;
      threadsObj[tid] = {
        tid,
        t,
      };
    }

    const colors = ['red', 'green', 'blue', '#791E94', 'yellow', '#87314e'];
    let colorIndex = 0;
    const getColor = () => {
      const color = colors[colorIndex];
      colorIndex++;
      if (colorIndex > colors.length - 1) {
        colorIndex = 0;
      }
      return color;
    };

    for (const post of posts) {
      let postType;
      if (post.type === 'thread') {
        postType = 'thread';
      } else if (post.parentPostId) {
        postType = 'comment';
      } else {
        postType = 'post';
      }

      let status = 'normal';
      if (postType === 'thread') {
        if (post.mainForumsId.includes(recycleId)) {
          status = 'disabled';
        }
      } else {
        if (post.toDraft) {
          status = 'toDraft';
        } else if (post.disabled) {
          status = 'disabled';
        }
      }

      const _forums = [];

      for (const fid of post.mainForumsId) {
        const forum = forumsObj[fid];
        if (!forum) {
          continue;
        }
        _forums.push(forum);
      }

      let thread;

      if (post.type === 'thread') {
        thread = {
          tid: post.tid,
          t: post.t,
        };
      } else {
        thread = threadsObj[post.tid];
      }

      const result = {
        pid: post.pid,
        toc: post.toc,
        user: {
          avatar: post.user.avatar,
          uid: post.user.uid,
          username: post.user.username,
        },
        type: postType,
        forums: _forums,
        thread,
        t: post.t,
        c: post.c,
        abstractCn: post.abstractCn,
        abstractEn: post.abstractEn,
        keyWordsCn: post.keyWordsCn,
        keyWordsEn: post.keyWordsEn,
        url: post.url,
        tcId: post.tcId,
        mainForumsId: post.mainForumsId,
        categoriesId: post.categoriesId,
        status,
        borderColor: getColor(),
      };

      results.push(result);
    }

    data.posts = results;
    data.paging = paging;
    data.queryData = {
      timeStart: timeStart ? Number(timeStart) : null,
      timeStop: timeStop ? Number(timeStop) : null,
      source: sourceArr,
      text,
      page,
      perPage,
    };
    data.nav = 'post';
    ctx.template = 'nkc/post/post.pug';
    await next();
  },
);
router.get(
  '/drafts',
  OnlyOperation(Operations.nkcManagementPost),
  async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    let {
      page = 0,
      perPage = 50,
      timeStart,
      timeStop = Date.now(),
      text = '',
      order = 'desc',
    } = query;
    text = text.trim();
    page = parseInt(page);
    if (isNaN(page) || page < 0) {
      page = 0;
    }
    perPage = parseInt(perPage);
    if (isNaN(perPage) || perPage < 1) {
      perPage = 50;
    }
    const match = {
      toc: {
        $lte: new Date(Number(timeStop)),
        $gte: timeStart ? new Date(Number(timeStart)) : new Date(0),
      },
    };

    if (text) {
      match.$or = [
        {
          uid: text,
        },
        {
          desTypeId: text,
        },
      ];
    }

    const count = await db.DraftModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count, perPage);
    let drafts = await db.DraftModel.find(match)
      .sort({ toc: order === 'desc' ? -1 : 1 })
      .skip(paging.start)
      .limit(paging.perpage);
    let usersId = [];
    const resourcesId = [];
    const resourcesObj = {};
    const draftResourcesId = {};
    for (const draft of drafts) {
      usersId.push(draft.uid);
      if (draft.l === 'json') {
        const rids = await db.ResourceModel.getResourcesIdByJson(draft.c);
        resourcesId.push(...rids);
        draftResourcesId[draft._id] = rids;
      }
    }
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds(
      usersId,
    );
    const resources = await db.ResourceModel.find({
      rid: { $in: [...resourcesId] },
    });
    for (const resource of resources) {
      await resource.setFileExist();
      await resource.filenameFilter();
      resourcesObj[resource.rid] = resource;
    }

    const results = [];
    for (const draft of drafts) {
      const user = usersObject[draft.uid];
      if (!user) {
        continue;
      }
      let c = '';
      if (draft.l === 'json') {
        const rids = draftResourcesId[draft._id] || [];
        const draftResources = rids
          .map((rid) => resourcesObj[rid] || [])
          .flat();
        c = renderHTMLByJSON({
          json: draft.c,
          resources: draftResources,
          xsf: 99999,
          atUsers: [],
        });
      } else {
        c = nkcRender.renderHTML({
          type: 'article',
          post: {
            c: draft.c,
          },
          user: { xsf: 9999 },
        });
      }
      results.push({
        toc: draft.toc,
        type: 'draft',
        draftType: draft.type,
        abstractCn: draft.abstractCn,
        abstractEn: draft.abstractEn,
        keyWordsCn: draft.keyWordsCn,
        keyWordsEn: draft.keyWordsEn,
        c,
        t: draft.t,
        user: {
          uid: user.uid,
          avatar: user.avatar,
          username: user.username,
        },
      });
    }

    data.posts = results;
    data.paging = paging;
    data.queryData = {
      timeStart: timeStart ? Number(timeStart) : null,
      timeStop: timeStop ? Number(timeStop) : null,
      source: ['draft'],
      text,
      page,
      perPage,
    };
    data.nav = 'post';
    ctx.template = 'nkc/post/post.pug';
    await next();
  },
);
module.exports = router;
