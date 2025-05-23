const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const homeTopRouter = require('./homeTop');
const adRouter = require('./ad');
const toppedRouter = require('./topped');
const blockRouter = require('./block');
const closeRouter = require('./close');
const Path = require('path');
const tools = require('../../nkcModules/tools');
const {
  collectionService,
} = require('../../services/subscribe/collection.service');
const { Operations } = require('../../settings/operations');
const { ObjectId } = require('mongodb');
const { editorRichService } = require('../../services/editor/rich.service');
const { Public, OnlyUnbannedUser } = require('../../middlewares/permission');
const {
  forumPermissionService,
} = require('../../services/forum/forumPermission.service');
threadRouter
  .use('/', Public(), async (ctx, next) => {
    const { db, state, data } = ctx;
    await db.ForumModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .get('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    const { user } = data;
    const { from, keywords, self, type, title, pid, applicationFormId } = query;
    // 通用接口，用于查询自己的文章
    if (type === 'selfThreads') {
      const { page = 0, columnId, pid } = query;
      let threads = [];
      if (pid) {
        threads = await db.ThreadModel.find({ oc: pid });
      } else {
        const q = {
          uid: user.uid,
          disabled: false,
          recycleMark: { $ne: true },
          reviewed: true,
        };
        const count = await db.ThreadModel.countDocuments(q);
        const paging = nkcModules.apiFunction.paging(page, count);
        data.paging = paging;
        threads = await db.ThreadModel.find(q)
          .sort({ toc: -1 })
          .skip(paging.start)
          .limit(paging.perpage);
      }
      threads = await db.ThreadModel.extendThreads(threads, {
        htmlToText: true,
      });
      if (columnId) {
        data.threads = [];
        const threadsId = threads.map((t) => t.oc);
        const contributes = await db.ColumnContributeModel.find(
          // { columnId, pid: { $in: threadsId }, passed: null },
          { columnId, pid: { $in: threadsId }, passed: 'pending' },
          { pid: 1 },
        );
        let columnPosts = await db.ColumnPostModel.find(
          { columnId, pid: { $in: threadsId } },
          { pid: 1 },
        );
        const pid = contributes
          .map((c) => c.pid)
          .concat(columnPosts.map((c) => c.pid));
        for (const thread of threads) {
          if (pid.includes(thread.oc)) {
            continue;
          }
          data.threads.push(thread);
        }
      } else {
        data.threads = threads;
      }
    } else if (type === 'applicationFormSearch') {
      const applicationForm = await db.FundApplicationFormModel.findOnly({
        _id: applicationFormId,
      });
      const users = await applicationForm.extendMembers();
      const usersId = users.map((u) => u.uid);
      usersId.push(user.uid);

      let posts = [];
      if (pid) {
        const post = await db.PostModel.findOne({
          pid,
          uid: { $in: usersId },
          disabled: false,
          recycleMark: false,
          reviewed: true,
        });
        if (post) {
          posts.push(post);
        }
      }
      if (title) {
        const q = {
          t: new RegExp(`${title}`, 'gi'),
          uid: { $in: usersId },
          disabled: false,
          reviewed: true,
        };
        if (pid) {
          q.pid = { $ne: pid };
        }
        const ps = await db.PostModel.find(q).sort({ toc: -1 });
        posts = posts.concat(ps);
      }

      data.posts = [];
      for (const post of posts) {
        const thread = await db.ThreadModel.findOne({ oc: post.pid });
        if (thread) {
          thread.firstPost = post;
          data.posts.push(thread.toObject());
        }
      }
    } else if (type === 'myPosts') {
      const threads = await db.ThreadModel.find({
        uid: user.uid,
        disabled: false,
        recycleMark: false,
        reviewed: true,
      })
        .sort({ toc: -1 })
        .limit(20);
      data.posts = [];
      for (const thread of threads) {
        const post = await db.PostModel.findOne({ pid: thread.oc });
        if (post) {
          thread.firstPost = post;
          data.posts.push(thread.toObject());
        }
      }
    } else if (from === 'applicationForm') {
      const outPostObj = (post) => {
        return {
          toc: post.toc.toLocaleString(),
          tid: post.tid,
          username: post.user.username,
          uid: post.uid,
          t: post.t,
          pid: post.pid,
        };
      };
      const perpage = (page, length) => {
        const perpage = 20;
        const start = perpage * page;
        return {
          page,
          start,
          perpage,
          pageCount: Math.ceil(length / perpage),
        };
      };
      const page = query.page ? parseInt(query.page) : 0;
      data.paging = { page: 0, pageCount: 1, perpage: 8 };
      const threads = [];
      let targetThreads = [];
      if (self === 'true') {
        const length = await db.ThreadModel.countDocuments({
          uid: user.uid,
          disabled: false,
        });
        const paging = perpage(page, length);
        targetThreads = await db.ThreadModel.find({
          uid: user.uid,
          disabled: false,
        })
          .sort({ toc: -1 })
          .skip(paging.start)
          .limit(paging.perpage);
        data.paging = paging;
      } else {
        const applicationForm = await db.FundApplicationFormModel.findOnly({
          _id: applicationFormId,
        });
        const users = await applicationForm.extendMembers();
        const usersId = users.map((u) => u.uid);
        usersId.push(user.uid);
        const post = await db.PostModel.findOne({
          pid: keywords,
          uid: { $in: usersId },
          disabled: false,
        });
        if (post !== null) {
          await post.extendThread();
          if (post.pid === post.thread.oc) {
            await post.extendUser();
            threads.push(outPostObj(post));
          }
        }
        const targetUser = await db.UserModel.findOne({
          usernameLowerCase: keywords.toLowerCase(),
        });
        if (targetUser !== null && usersId.includes(targetUser.uid)) {
          const length = await db.ThreadModel.countDocuments({
            uid: targetUser.uid,
            disabled: false,
          });
          const paging = perpage(page, length);
          targetThreads = await db.ThreadModel.find({
            uid: targetUser.uid,
            disabled: false,
          })
            .sort({ toc: -1 })
            .skip(paging.start)
            .limit(paging.perpage);
          data.paging = paging;
        }
      }
      for (let t of targetThreads) {
        const post = await t.extendFirstPost();
        await post.extendUser();
        threads.push(outPostObj(post));
      }
      data.threads = threads;
    }
    await next();
  })
  .use('/:tid', Public(), async (ctx, next) => {
    const { internalData, db, params } = ctx;
    internalData.thread = await db.ThreadModel.findOnly({ tid: params.tid });
    await next();
  })
  .get('/:tid', Public(), async (ctx, next) => {
    // 设置 referer 策略
    // 解决分享文章时附件链接跨域无法读取referer中token的问题
    ctx.set('Referrer-Policy', 'unsafe-url');
    await next();
  })
  .get('/:tid', Public(), async (ctx, next) => {
    //
    const showSecretWatermark =
      !(await forumPermissionService.visitorHasReadPermission(
        ctx.internalData.thread.mainForumsId,
      ));
    if (showSecretWatermark) {
      ctx.data.secretWatermarkUrl = tools.getUrl(
        'secretWatermark',
        ctx.internalData.thread.tid,
      );
    }
    await next();
  })
  .get('/:tid', Public(), async (ctx, next) => {
    const { data, db, query, nkcModules, state, internalData } = ctx;
    const { token } = query;
    const { page = 0, pid, last_page, highlight, step, t, e = false } = query;
    const isEditMode = e;
    let mainForum = null;
    let forumsNav = [];
    let threadNav = [];
    let isModerator = false;
    let collectedCount = 0;
    let anonymous = false;
    let toppedPosts = [];
    let voteUpPostInfo = '';
    let voteUpPosts = [];
    let authorColumn = null;
    let addedToColumn = false;
    let usersThreads = [];
    let targetUser = null;
    let targetColumn = null;
    let columnPost = null;
    let targetUserThreads = [];
    let threadReviewReason = '';
    let threadShopInfo = null;
    let threadFundInfo = null;
    let collected = false;
    let sendAnonymousPost = false;
    let homeAd = false;
    let homeTopped = false;
    let latestTopped = false;
    let communityTopped = false;
    let goodsHomeTopped = false;
    let sameThreads = [];

    if (data.user) {
      await data.user.extendAuthLevel();
    }
    // 拓展POST时的相关配置
    const extendPostOptions = {
      uid: data.user ? data.user.uid : '',
      visitor: data.user, // 用于渲染页面时比对学术分隐藏
      toDraftReason: true,
    };

    const { thread } = internalData;

    const tid = thread.tid;
    if (isEditMode) {
      //判断是否拥有进入编辑模式的权限
      await db.ForumModel.checkEditPostPositionInRoute({
        uid: state.uid,
        fid: [thread.mainForumsId],
        tid,
        isAdmin: ctx.permission('modifyAllPostOrder'),
      });
    }
    const source = await db.ReviewModel.getDocumentSources();
    // 拓展文章属性
    await thread.extendThreadCategories();
    const authorId = thread.uid;

    // 拓展文章所属专业
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    for (const forum of forums) {
      const { fid, cid } = forum;
      forum.url = await db.ForumModel.getUrl(fid, cid);
    }
    if (forums.length > 0) {
      mainForum = forums[0];
    }

    // 判断用户是否为专家
    isModerator = await db.ForumModel.isModerator(
      state.uid,
      thread.mainForumsId,
    );

    // 获取当前用户有权查看的专业ID
    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user,
    );

    // 权限判断（通过分享链接访问时无需判断时间权限、专业文章阅读权限）
    if (!(await db.ShareModel.hasPermission(token, thread.tid))) {
      // 权限判断（时间限制）
      await db.SettingModel.restrictAccess({
        toc: thread.toc,
        forums: forums,
        isAuthor: state.uid && state.uid === thread.uid,
        userRolesId: data.userRoles.map((role) => role._id),
        userGradeId: data.userGrade._id,
      });

      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
    }

    // 权限判断（未审核时）
    if (!thread.reviewed) {
      if (!data.user || (!isModerator && data.user.uid !== thread.uid)) {
        ctx.throw(403, '文章还未通过审核，暂无法访问');
      }
    }

    // 权限判断（退回修改时）
    // 文章处于已被退回的状态
    if (thread.recycleMark) {
      // 用户不具有专家权限
      if (!isModerator) {
        // 访问用户没有查看被退回文章的权限，且不是自己发表的文章则抛出403
        if (!data.userOperationsId.includes('displayRecycleMarkThreads')) {
          if (!data.user || thread.uid !== data.user.uid) {
            ctx.throw(403, '文章已被退回修改，暂无法阅读。');
          }
        }
      }
      // 获取文章被退回的原因
      const threadLogOne = await db.DelPostLogModel.findOne({
        threadId: tid,
        postType: 'thread',
        delType: 'toDraft',
        modifyType: false,
      }).sort({ toc: -1 });
      thread.reason = threadLogOne.reason || '';
    }
    // 高亮楼层
    if (pid && step === undefined) {
      const url = await db.PostModel.getUrl(pid);
      ctx.status = 303;
      return ctx.redirect(url);
    }

    // 加载文章内容POST
    let firstPost = await db.PostModel.findOnly({ pid: thread.oc });

    const authorRegisterInfo = await db.UserModel.getAccountRegisterInfo({
      uid: thread.uid,
      ipId: firstPost.ipoc,
    });

    firstPost = await db.PostModel.extendPost(firstPost, extendPostOptions);
    const _firstPost = (await db.PostModel.filterPostsInfo([firstPost]))[0];
    const firstPostCredit = {
      kcb: _firstPost.kcb,
      xsf: _firstPost.xsf,
    };
    firstPost.t = nkcModules.nkcRender.replaceLink(firstPost.t);
    thread.firstPost = firstPost;
    // 加载文章待审原因
    if (!firstPost.reviewed) {
      const reviewRecord = await db.ReviewModel.findOne({
        sid: firstPost.tid,
        source: source.post,
      }).sort({ toc: -1 });
      threadReviewReason = reviewRecord ? reviewRecord.reason : '';
    }
    // 设置匿名标志，前端页面会根据此标志，判断是否默认勾选匿名发表勾选框
    anonymous = firstPost.anonymous;
    // 构建回复的查询条件
    const match = {
      tid: thread.tid,
      type: 'post',
      parentPostsId: {
        $size: 0,
      },
    };
    // 只看作者的回复
    if (t === 'author' && !isEditMode) {
      match.anonymous = !!anonymous;
      match.uid = thread.uid;
    }
    const $and = [];
    // 若没有查看被屏蔽的post的权限，判断用户是否为该专业的专家，专家可查看
    // 判断是否为该专业的专家
    // 如果是该专业的专家，加载所有的post；如果不是，则判断有没有相应权限。
    if (!isModerator) {
      if (!data.userOperationsId.includes('displayRecycleMarkThreads')) {
        const $or = [
          {
            disabled: false,
            toDraft: { $ne: true },
          },
        ];
        // 用户能查看自己被退回的回复
        if (data.user) {
          $or.push({
            // disabled: true,
            toDraft: true,
            uid: data.user.uid,
          });
        }
        $and.push({ $or });
      }
      if (!data.userOperationsId.includes('displayDisabledPosts')) {
        const $or = [
          {
            disabled: false,
          },
        ];
        $and.push({ $or });
      }
      if ($and.length !== 0) {
        match.$and = $and;
      }
    }
    if (data.user) {
      if (!isModerator) {
        match.$or = [
          {
            reviewed: true,
          },
          {
            reviewed: false,
            uid: data.user.uid,
          },
        ];
      }
    } else {
      match.reviewed = true;
    }

    // 获取分页相关配置
    const pageSettings = await db.SettingModel.getSettings('page');
    const count = await db.PostModel.countDocuments(match);
    const { pageCount } = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.threadPostList,
    );
    // 访问最后一页
    let _page = page;
    if (last_page) {
      _page = pageCount - 1;
    }
    // const paging = nkcModules.apiFunction.paging(
    //   _page,
    //   count,
    //   pageSettings.threadPostList,
    // );
    const paging = isEditMode
      ? nkcModules.apiFunction.paging(0, count, count)
      : nkcModules.apiFunction.paging(
          _page,
          count,
          pageSettings.threadPostList,
        );

    let posts = [];
    // 获取回复列表
    //判断是否进入编辑模式
    // if (!isEditMode) {
    //   //没有进入编辑模式
    //   if (thread) {
    //     const { postIds } = thread;
    //     const topPostsId = postIds.slice(
    //       paging.start,
    //       paging.start + paging.perpage,
    //     );
    //     match.pid = { $in: topPostsId }; // 添加的条件
    //   }
    // } else {
    //   //进入了编辑模式
    //   //判断是否拥有进入编辑模式的权限
    //   await db.ForumModel.checkEditPostPositionInRoute({
    //     uid: state.uid,
    //     fid: [thread.mainForumsId],
    //     tid,
    //     isAdmin: ctx.permission('modifyAllPostOrder'),
    //   });
    // }
    // posts = await db.PostModel.find(match);
    posts = await db.PostModel.aggregate([
      {
        $match: match,
      },
      {
        $addFields: {
          order: { $indexOfArray: [thread.postIds, '$pid'] },
        },
      },
      {
        $sort: {
          order: 1,
        },
      },
      {
        $skip: paging.start,
      },
      {
        $limit: paging.perpage,
      },
    ]);
    posts = await db.PostModel.extendPosts(posts, extendPostOptions);
    posts = await db.PostModel.filterPostsInfo(posts);
    // posts = await db.PostModel.reorderByThreadModelPostsIds(tid, posts);
    // 拓展待审回复的理由
    const _postsId = [];
    for (let i = 0; i < posts.length; i++) {
      const _post = posts[i];
      _postsId.push(_post.pid);
    }
    const reviewRecords = await db.ReviewModel.find({
      sid: { $in: _postsId },
    }).sort({ toc: -1 });
    const reviewRecordsObj = {};
    for (let i = 0; i < reviewRecords.length; i++) {
      const reviewRecord = reviewRecords[i];
      const { pid } = reviewRecord;
      if (reviewRecordsObj[pid]) {
        continue;
      }
      reviewRecordsObj[pid] = reviewRecord;
    }
    for (let i = 0; i < posts.length; i++) {
      const _post = posts[i];
      const reviewRecord = reviewRecordsObj[_post.pid];
      _post.reviewReason = reviewRecord ? reviewRecord.reason : '';
    }

    // 获取置顶回复列表
    if (
      paging.page === 0 &&
      thread.toppedPostsId &&
      thread.toppedPostsId.length > 0
    ) {
      const toppedMatch = Object.assign({}, match);
      toppedMatch.pid = { $in: thread.toppedPostsId };
      let _toppedPosts = await db.PostModel.find(toppedMatch);
      _toppedPosts = await db.PostModel.extendPosts(_toppedPosts, {
        uid: data.user ? data.user.uid : '',
        visitor: data.user,
        url: true,
      });
      const _toppedPostsObj = {};
      for (let i = 0; i < _toppedPosts.length; i++) {
        const _toppedPost = _toppedPosts[i];
        _toppedPostsObj[_toppedPost.pid] = _toppedPost;
      }
      for (const toppedPostId of thread.toppedPostsId) {
        const p = _toppedPostsObj[toppedPostId];
        if (p) {
          toppedPosts.push(p);
        }
      }
      toppedPosts = await db.PostModel.filterPostsInfo(_toppedPosts);
    }

    // 获取高赞回复列表
    if (paging.page === 0) {
      // 获取高赞文章
      const voteUpPostSettings = await thread.forums[0].getVoteUpPostSettings();
      const { voteUpCount, postCount, selectedPostCount, voteDownRatio } =
        voteUpPostSettings;
      voteUpPostInfo = `当不小于 ${postCount} 篇回复的点赞数 ≥ ${voteUpCount} 时，选取点赞数前 ${selectedPostCount} 的回复`;
      if (voteUpPostSettings.status === 'show') {
        let voteUpPostsId = await db.PostModel.aggregate([
          {
            // 查找点赞数达到设置值的回复
            $match: {
              tid,
              type: 'post',
              parentPostId: '',
              voteUp: {
                $gte: voteUpCount,
              },
            },
          },
          {
            $project: {
              pid: 1,
              // 计算点踩比例
              ratio: {
                $divide: [
                  '$voteDown',
                  {
                    $add: ['$voteUp', '$voteDown'],
                  },
                ],
              },
              // 计算有效点赞数
              effectiveVoteUp: {
                $subtract: ['$voteUp', '$voteDown'],
              },
            },
          },
          {
            // 排除掉点踩比例过大的回复
            $match: {
              ratio: {
                $lte: voteDownRatio / 100,
              },
            },
          },
          {
            $project: {
              pid: 1,
              effectiveVoteUp: 1,
            },
          },
          {
            // 按有效点赞数逆序排序
            $sort: {
              effectiveVoteUp: -1,
            },
          },
          {
            $limit: postCount,
          },
        ]);

        if (voteUpPostsId.length === postCount) {
          voteUpPostsId = voteUpPostsId
            .splice(0, selectedPostCount)
            .map((p) => p.pid);
          const voteUpMatch = Object.assign({}, match);
          voteUpMatch.pid = { $in: voteUpPostsId };
          let _voteUpPosts = await db.PostModel.find(voteUpMatch);
          _voteUpPosts = await db.PostModel.extendPosts(_voteUpPosts, {
            uid: data.user ? data.user.uid : '',
            visitor: data.user,
            url: true,
          });
          const voteUpPostsObj = {};
          _voteUpPosts.map((p) => {
            voteUpPostsObj[p.pid] = p;
          });
          for (const voteUpPostId of voteUpPostsId) {
            const p = voteUpPostsObj[voteUpPostId];
            if (p) {
              voteUpPosts.push(p);
            }
          }
          voteUpPosts = await db.PostModel.filterPostsInfo(voteUpPosts);
        }
      }
    }

    // 作者头像链接
    let authorAvatarUrl = '';
    if (!anonymous) {
      authorAvatarUrl = nkcModules.tools.getUrl(
        'userAvatar',
        firstPost.user.avatar,
        'sm',
      );
    }

    // 设置作者标志
    thread.firstPost.ownPost = data.user && data.user.uid === thread.uid;

    // 获取访问者已发表的文章
    if (data.user) {
      usersThreads = await data.user.getUsersThreads();
    }

    // 判断用户是否将当前文章加入到了自己的专栏
    const userColumn = await db.UserModel.getUserColumn(state.uid);
    if (data.user) {
      if (userColumn) {
        addedToColumn =
          (await db.ColumnPostModel.countDocuments({
            columnId: userColumn._id,
            type: 'thread',
            tid: thread.tid,
          })) > 0;
      }
      if (thread.uid === data.user.uid) {
        // 标记未读的回复提醒为已读状态
        await db.MessageModel.clearMessageSTU({
          type: 'thread',
          oc: thread.oc,
          uid: thread.uid,
        });
        // 专栏判断
        authorColumn = await db.UserModel.getUserColumn(thread.uid);
      }
    }

    // 加载作者其他信息
    if (!anonymous) {
      targetUser = await thread.extendUser();
      targetUser.description = nkcModules.nkcRender.replaceLink(
        targetUser.description,
      );
      targetUser.avatar = nkcModules.tools.getUrl(
        'userAvatar',
        targetUser.avatar,
      );
      targetUser.description = nkcModules.markdown.renderMarkdown(
        targetUser.description,
      );
      await targetUser.extendGrade();
      await db.UserModel.extendUserInfo(targetUser);
      if (targetUser && typeof targetUser.toObject === 'function') {
        targetUser = targetUser.toObject();
      }
      targetColumn = await db.UserModel.getUserColumn(targetUser.uid);
      if (targetColumn) {
        columnPost = await db.ColumnPostModel.findOne({
          columnId: targetColumn._id,
          type: 'thread',
          pid: thread.oc,
        });
      }
      const q = {
        uid: targetUser.uid,
        reviewed: true,
        mainForumsId: { $in: fidOfCanGetThreads },
        recycleMark: { $ne: true },
      };
      targetUserThreads = await db.ThreadModel.find(q)
        .sort({ toc: -1 })
        .limit(10);
      targetUserThreads = await db.ThreadModel.extendThreads(
        targetUserThreads,
        {
          forum: true,
          firstPostUser: true,
          lastPost: false,
          excludeAnonymousPost: true,
        },
      );
      for (const t of targetUserThreads) {
        if (t.firstPost && t.firstPost.toObject) {
          t.firstPost = t.firstPost.toObject();
        }
      }
    }

    let userSubscribeUsersId = [];

    // 判断是否收藏、关注，是否可以发表匿名内容
    if (data.user) {
      collected = await collectionService.isCollectedThread(data.user.uid, tid);
      sendAnonymousPost = await db.UserModel.havePermissionToSendAnonymousPost(
        'postToThread',
        data.user.uid,
        thread.mainForumsId,
      );
      userSubscribeUsersId = await db.SubscribeModel.getUserSubUsersId(
        data.user.uid,
      );
    }

    // 判断文章是否置顶
    const homeSettings = await db.SettingModel.getSettings('home');
    const { fixed, movable } = homeSettings.recommendThreads;
    const ads = fixed.manuallySelectedThreads.concat(
      fixed.automaticallySelectedThreads,
      movable.manuallySelectedThreads,
      movable.automaticallySelectedThreads,
    );
    homeAd = ads.map((a) => a.tid).includes(thread.tid);
    // homeTopped = homeSettings.toppedThreadsId.includes(thread.tid);
    // latestTopped = homeSettings.latestToppedThreadsId.includes(thread.tid);
    // communityTopped = homeSettings.communityToppedThreadsId.includes(thread.tid);
    homeTopped = await db.SettingModel.isEqualOfArr(
      homeSettings.toppedThreadsId,
      { id: thread.tid, type: 'thread' },
    );
    latestTopped = await db.SettingModel.isEqualOfArr(
      homeSettings.latestToppedThreadsId,
      { id: thread.tid, type: 'thread' },
    );
    communityTopped = await db.SettingModel.isEqualOfArr(
      homeSettings.communityToppedThreadsId,
      { id: thread.tid, type: 'thread' },
    );
    // 获取相似文章
    let fids = thread.mainForumsId.concat(thread.minorForumsId);
    fids = fids.filter((id) => fidOfCanGetThreads.includes(id));
    if (fids.length !== 0) {
      const _sameThreads = await db.ThreadModel.aggregate([
        {
          $match: {
            reviewed: true,
            mainForumsId: fids,
            digest: true,
            recycleMark: { $ne: true },
          },
        },
        {
          $sample: {
            size: 10,
          },
        },
      ]);
      sameThreads = await db.ThreadModel.extendThreads(_sameThreads, {
        lastPost: false,
        forum: true,
        firstPost: true,
        firstPostUser: true,
      });
      for (const t of sameThreads) {
        if (t.firstPost && t.firstPost.toObject) {
          t.firstPost = t.firstPost.toObject();
        }
      }
    }

    // 如果是匿名发表的文章则在此清除作者信息
    if (thread.firstPost.anonymous) {
      thread.uid = '';
      thread.firstPost.uid = '';
      thread.firstPost.uidlm = '';
    }

    const checkEditPostPosition = await db.ForumModel.checkEditPostPosition({
      uid: state.uid,
      tid,
      isAdmin: ctx.permission('modifyAllPostOrder'),
    });

    const haveEditPositionOrder = checkEditPostPosition.status === 200;

    // 发表权限判断
    // const postSettings = await db.SettingModel.getSettings('post');
    let userPostCountToday = 0;
    let hasPermissionToHidePost = null;
    let blackListUsersId = [];
    if (data.user) {
      if (!data.user.volumeA) {
        // 加载考试设置
        // data.examSettings = (await db.SettingModel.findOnly({_id: 'exam'})).c;
        const today = nkcModules.apiFunction.today();
        const todayThreadCount = await db.ThreadModel.countDocuments({
          toc: { $gt: today },
          uid: data.user.uid,
        });
        let todayPostCount = await db.PostModel.countDocuments({
          toc: { $gt: today },
          uid: data.user.uid,
        });
        userPostCountToday = todayPostCount - todayThreadCount;
      }
      hasPermissionToHidePost = await db.PostModel.ensureHidePostPermission(
        thread,
        data.user,
      );
      blackListUsersId = await db.BlacklistModel.getBlacklistUsersId(
        data.user.uid,
      );
    }

    // 获取文章附件数
    let attachmentsCount = 0;
    if (
      await db.PostModel.ensureAttachmentPermission(
        data.user ? data.user.uid : '',
      )
    ) {
      const allPosts = await db.PostModel.find({ tid: thread.tid }, { pid: 1 });
      const pid = allPosts.map((p) => p.pid);
      attachmentsCount = await db.ResourceModel.countDocuments({
        mediaType: 'mediaAttachment',
        references: { $in: pid },
      });
    }

    // 加载笔记信息
    let notes = [];
    // if (ctx.permission('viewNote')) {
    const notePosts = [
      {
        pid: thread.oc,
        cv: thread.firstPost.cv,
      },
    ];
    posts.map((post) => {
      notePosts.push({
        pid: post.pid,
        cv: post.cv,
      });
    });
    notes = await db.NoteModel.getNotesByPosts(notePosts);
    // }

    // 黑名单判断
    let blacklistInfo = '';
    if (thread.uid && data.user) {
      blacklistInfo = await db.BlacklistModel.getBlacklistInfo(
        thread.uid,
        data.user.uid,
        ctx.permission('canSendToEveryOne'),
      );
    }

    // 加载同级专业
    const threadForums = thread.forums;
    let parentForumsId = [];
    const visibilityForumsIdFromRedis =
      await db.ForumModel.getVisibilityForumsIdFromRedis();
    for (const tf of threadForums) {
      parentForumsId = parentForumsId.concat(tf.parentsId);
    }
    const sameLevelForums = await db.ForumModel.find(
      {
        fid: {
          $in: fidOfCanGetThreads
            .concat(visibilityForumsIdFromRedis)
            .filter((fid) => !thread.mainForumsId.includes(fid)),
        },
        parentsId: {
          $in: parentForumsId,
        },
      },
      { displayName: 1, fid: 1, parentsId: 1 },
    ).sort({ order: 1 });
    for (const forum of sameLevelForums) {
      forum.url = await db.ForumModel.getUrl(forum.fid);
    }

    // 帖子设置
    const threadSettings = await db.SettingModel.getSettings('thread');
    // 发表权限
    // const postPermission = await db.UserModel.getPostPermission(
    //   state.uid,
    //   'post',
    //   thread.mainForumsId,
    // );

    // 回复遮罩设置
    const hidePostSettings = await db.SettingModel.getSettings('hidePost');
    const postHeight = hidePostSettings.postHeight;

    // 获取商品信息
    if (thread.type === 'product') {
      threadShopInfo = await db.ThreadModel.extendShopInfo({
        tid: thread.tid,
        oc: thread.oc,
        uid: state.uid,
        gradeId: data.user ? data.user.grade._id : 0,
        address: ctx.address,
      });
    } else if (thread.type === 'fund') {
      const accessForumsId = await db.ForumModel.getAccessibleForumsId(
        data.userRoles,
        data.userGrade,
        data.user,
      );
      threadFundInfo = await db.ThreadModel.extendFundInfo({
        tid: thread.tid,
        uid: state.uid,
        accessForumsId,
        displayFundApplicationFormSecretInfoPermission: ctx.permission(
          'displayFundApplicationFormSecretInfo',
        ),
      });
    }

    // 如果访问者就是文章作者，判断当前文章是否被加入专栏

    // 获取文章专业导航
    for (const f of thread.mainForumsId) {
      const nav = await db.ForumModel.getForumNav(f);
      if (nav.length) {
        forumsNav.push(nav);
      }
    }

    // 页面顶部导航
    threadNav = await thread.getThreadNav();
    for (const nav of threadNav) {
      const { fid, cid } = nav;
      nav.url = await db.ForumModel.getUrl(fid, cid);
    }

    // 文章收藏数
    collectedCount = await db.ThreadModel.getCollectedCountByTid(thread.tid);

    // 页面名称
    const serverSettings = await db.SettingModel.getSettings('server');
    const pageTitle = `${firstPost.t} - ${serverSettings.websiteName}`;

    // 网站简介
    const serverBrief = serverSettings.brief;
    const serverBackgroundColor = serverSettings.backgroundColor;

    // 页面需要的权限
    const permissions = {
      showManagement:
        data.user &&
        isModerator &&
        ctx.permissionsOr([
          'pushThread',
          'moveThreads',
          'movePostsToDraft',
          'movePostsToRecycle',
          // 'digestThread',
          // 'unDigestThread',
          'toppedThread',
          'unToppedThread',
          'homeTop',
          'unHomeTop',
        ]),
      disablePost:
        ctx.permissionsOr(['movePostsToRecycle', 'movePostsToDraft']) &&
        isModerator,
      unblockPosts: ctx.permission('unblockPosts') && isModerator,
      pushThread: ctx.permission('pushThread'),
      moveThreads: ctx.permission('moveThreads'),
      toDraftOrToRecycle: ctx.permissionsOr([
        'movePostsToDraft',
        'movePostsToRecycle',
      ]),
      creditKcb:
        !thread.firstPost.anonymous &&
        data.user &&
        thread.firstPost.uid !== data.user.uid,
      violationRecord: ctx.permission('violationRecord'),
      viewNote: true,
      getPostAuthor: ctx.permission('getPostAuthor'),
      creditKcbPost: !!data.user,
      banSaleProductParams: ctx.permission('banSaleProductParams'),
      cancelXsf: ctx.permission('cancelXsf'),
      modifyKcbRecordReason: ctx.permission('modifyKcbRecordReason'),
      review: ctx.permission('review'),
      fundBlacklistPost: ctx.permission('fundBlacklistPost'),
      modifyThreadOrder: ctx.permission(Operations.modifyThreadOrder),
    };

    // 学术分 鼓励
    const creditScore = await db.SettingModel.getScoreByOperationType(
      'creditScore',
    );

    // 访问者的专栏

    const columnPermission = await db.UserModel.ensureApplyColumnPermission(
      data.user,
    );

    // 是否关注作者
    const subscribeAuthor = !!(
      data.user && userSubscribeUsersId.includes(authorId)
    );

    //文章通告内容处理
    //屏蔽通告权限
    let shieldNotice = ctx.permission('disablePostNotice');
    //编辑通告权限
    let canEditNotice =
      thread.uid === state.uid || ctx.permission('disablePostNotice');
    const noticeObj = { pid: thread.oc, status: 'normal' };
    if (shieldNotice || thread.uid === state.uid) {
      noticeObj.status = { $in: ['normal', 'shield'] };
    }
    const notices = await db.NewNoticesModel.find(noticeObj)
      .sort({ toc: -1 })
      .lean();
    //查看回复历史权限
    let threadHistory = null;
    if (notices.length !== 0) {
      const threadPost = await db.PostModel.findOnly({ pid: thread.oc });
      const isModerator = await db.PostModel.isModerator(state.uid, thread.oc);
      //判断是否有查看历史记录的权限
      if (
        threadPost.tlm > threadPost.toc &&
        ctx.permission('visitPostHistory') &&
        isModerator
      ) {
        threadHistory =
          !threadPost.hideHistories ||
          ctx.permission('displayPostHideHistories')
            ? true
            : null;
      }
      const userId = Array.from(new Set(notices.map((item) => item.uid)));
      //获取通告用户信息
      const users = await db.UserModel.find(
        { uid: { $in: userId } },
        { avatar: 1, uid: 1, username: 1 },
      ).lean();

      //获取历史版本
      const cv = Array.from(
        new Set(notices.map((item) => item.cv).filter(Boolean)),
      );
      //获取hid数组对象
      const hidArr = await db.HistoriesModel.find(
        { pid: thread.oc, cv: { $in: cv } },
        { _id: 1, cv: 1, pid: 1 },
      ).lean();
      //筛选出来的hid对象
      const uniqueArr = hidArr.filter((item, index, self) => {
        return index === self.findIndex((t) => t.cv === item.cv);
      });

      data.noticeContent = notices.map(
        ({ toc, noticeContent, cv, uid, pid, nid, status, reason }) => {
          const user = users.find((item) => item.uid === uid);
          const hidObj = uniqueArr.find((item) => item.cv === cv);
          const updatedUser = {
            ...user,
            avatar: tools.getUrl('userAvatar', user.avatar),
          };
          return {
            toc,
            noticeContent,
            hid: hidObj ? hidObj._id : null,
            user: updatedUser,
            pid,
            nid,
            status,
            reason,
            cv,
          };
        },
      );
    }

    //赛选出文章下的回复，哪些是有发过通告的pid
    const postNotice = await db.NewNoticesModel.aggregate([
      { $match: { pid: { $in: thread.postIds } } },
      { $group: { _id: '$pid' } },
    ]).exec();
    const repliesWithNotice = postNotice.map((item) => item._id);

    // 文章访问次数加一
    await thread.updateOne({ $inc: { hits: 1 } });
    // 标志
    data.t = t;
    data.creditScore = creditScore;
    data.subscribeAuthor = subscribeAuthor;
    data.cat = thread.cid;
    data.pid = pid;
    data.firstPostCredit = firstPostCredit;
    data.userColumn = userColumn;
    data.columnPermission = columnPermission;
    data.serverBrief = serverBrief;
    data.serverBackgroundColor = serverBackgroundColor;
    data.pageTitle = pageTitle;
    data.permissions = permissions;
    data.step = step;
    data.replyTarget = `t/${thread.tid}`;
    data.thread = thread.toObject();
    data.forums = forums;
    data.posts = posts;
    data.targetUserThreads = targetUserThreads;
    data.threadReviewReason = threadReviewReason;
    data.columnPost = columnPost;
    data.targetUser = targetUser;
    data.targetColumn = targetColumn;
    data.usersThreads = usersThreads;
    data.authorColumn = authorColumn;
    data.addedToColumn = addedToColumn;
    data.voteUpPosts = voteUpPosts;
    data.voteUpPostInfo = voteUpPostInfo;
    data.paging = paging;
    data.highlight = highlight;
    data.forum = mainForum;
    data.forumsNav = forumsNav;
    data.isModerator = isModerator;
    data.threadNav = threadNav;
    data.collectedCount = collectedCount;
    data.anonymous = anonymous;
    data.toppedPosts = toppedPosts;
    data.collected = collected;
    data.sendAnonymousPost = sendAnonymousPost;
    data.sameThreads = sameThreads;
    data.homeAd = homeAd;
    data.homeTopped = homeTopped;
    data.latestTopped = latestTopped;
    data.communityTopped = communityTopped;
    data.userPostCountToday = userPostCountToday;
    data.hasPermissionToHidePost = hasPermissionToHidePost;
    data.blackListUsersId = blackListUsersId;
    data.attachmentsCount = attachmentsCount;
    data.postHeight = postHeight;
    data.notes = notes;
    data.blacklistInfo = blacklistInfo;
    data.sameLevelForums = sameLevelForums;
    data.threadSettings = threadSettings;
    // data.postPermission = postPermission;
    data.authorAvatarUrl = authorAvatarUrl;
    data.authorRegisterInfo = authorRegisterInfo;
    data.userSubscribeUsersId = userSubscribeUsersId;
    data.editPostPositionPermission = haveEditPositionOrder;
    data.isEditMode = isEditMode;
    data.orderStatus = thread.orderStatus;
    data.threadHistory = threadHistory;
    data.canEditNotice = canEditNotice;
    data.shieldNotice = shieldNotice;
    data.repliesWithNotice = repliesWithNotice;

    // 商品信息
    if (threadShopInfo) {
      const {
        closeSaleDescription,
        userAddress,
        product,
        vipDiscount,
        paId,
        vipDisNum,
      } = threadShopInfo;
      data.closeSaleDescription = closeSaleDescription;
      data.userAddress = userAddress;
      data.product = product;
      data.vipDiscount = vipDiscount;
      data.vipDisNum = vipDisNum;
      data.paId = paId;
      if (thread.type === 'product' && ctx.permission('pushGoodsToHome')) {
        goodsHomeTopped = homeSettings.shopGoodsId.includes(product.productId);
      }
      data.goodsHomeTopped = goodsHomeTopped;
    }

    // 基金相关
    if (threadFundInfo) {
      const {
        applicationForm,
        fund,
        fundName,
        userFundRoles,
        targetUserInFundBlacklist,
      } = threadFundInfo;

      data.applicationForm = applicationForm;
      data.fund = fund;
      data.fundName = fundName;
      data.userFundRoles = userFundRoles;
      data.targetUserInFundBlacklist = targetUserInFundBlacklist;
    }

    // ctx.template = 'thread/index.pug';
    ctx.remoteTemplate = 'thread/index.pug';
    await next();
  })
  .get('/:tid', Public(), async (ctx, next) => {
    const { data, db, state } = ctx;
    const { thread } = data;
    if (thread && thread.tid && state.uid) {
      await db.UsersGeneralModel.updateThreadAccessLogs(state.uid, thread.tid);
    }
    await next();
  })
  .post('/:tid', OnlyUnbannedUser(), async (ctx, next) => {
    // 社区文章发表评论
    const { data, nkcModules, params, db, body, state, address: ip } = ctx;

    const { user } = data;

    try {
      await db.UserModel.checkUserBaseInfo(user, true);
    } catch (err) {
      ctx.throw(
        403,
        `因为缺少必要的账户信息，无法完成该操作。具体信息：${err.message}`,
      );
    }

    const { post, postType } = body;

    const { tid } = params;
    const thread = await db.ThreadModel.findOnly({ tid });
    const updateCount = await db.ForumModel.updateCount;
    await updateCount([thread], false);
    await thread.extendFirstPost();
    if (thread.closed) {
      ctx.throw(400, '主题已关闭，暂不能发表回复/评论');
    }
    if (!thread.reviewed) {
      ctx.throw(403, '文章还未通过审核，暂不能发表回复/评论');
    }
    if (thread.recycleMark) {
      ctx.throw(403, '文章退回修改中，暂不能发表回复/评论');
    }

    if (!ctx.permission('canSendToEveryOne')) {
      let inBlacklist;
      if (postType === 'comment') {
        const pp = await db.PostModel.findOnly({ pid: post.parentPostId });
        if (!pp.reviewed) {
          ctx.throw(403, '回复还未通过审核，暂不能发表回复/评论');
        }
        if (pp.toDraft) {
          ctx.throw(403, '回复退回修改中，暂不能发表回复/评论');
        }
        if (pp.disabled) {
          ctx.throw(403, '回复已被屏蔽，暂不能发表回复/评论');
        }
        inBlacklist = await db.BlacklistModel.inBlacklist(pp.uid, user.uid);
      } else {
        inBlacklist = await db.BlacklistModel.inBlacklist(thread.uid, user.uid);
      }
      if (inBlacklist) {
        ctx.throw(403, `你在对方的黑名单中，对方可能不希望与你交流。`);
      }
    }

    data.thread = thread;
    await thread.extendForums(['mainForums', 'minorForums']);
    data.forum = thread.forum;
    // 权限判断
    // await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
    await db.ForumModel.checkGlobalPostAndForumWritePostPermission(
      data.user.uid,
      thread.mainForumsId,
    );
    // 评论权限判断
    if (
      postType === 'comment' &&
      !(await db.PostModel.checkPostCommentPermission(
        post.parentPostId,
        'write',
      ))
    ) {
      ctx.throw(403, `当前回复不允许评论`);
    }
    const {
      columnMainCategoriesId = [],
      columnMinorCategoriesId = [],
      anonymous = false,
      did,
    } = post;
    if (post.t && post.t.length > 100) {
      ctx.throw(400, `标题不能超过100个字`);
    }
    let contentSize = editorRichService.getRichContentWordsSize(post.l, post.c);
    if (contentSize < 2) {
      ctx.throw(400, `内容不能少于2个字`);
    }
    // 字数限制
    if (postType === 'comment') {
      // 作为评论 不能超过500字
      if (contentSize > 500) {
        ctx.throw(400, `内容不能超过500字`);
      }
    } else {
      // 作为回复 不能超过10万字
      if (contentSize > 100000) {
        ctx.throw(400, `内容不能超过10万字`);
      }
    }
    nkcModules.checkData.checkString(post.c, {
      name: '内容',
      minLength: 1,
      maxLength: 2000000,
    });
    // 检查提交的内容在草稿中的状态
    // if (post._id) {
    //   const draftDid =
    //     did ||
    //     (await db.DraftModel.findOnly({ _id: new ObjectId(post._id) }, { did: 1 }))
    //       .did;
    //   if (draftDid) {
    //     const beta = (await db.DraftModel.getType()).beta;
    //     const betaDaft = await db.DraftModel.findOne({
    //       did: draftDid,
    //       type: beta,
    //       uid: state.uid,
    //     }).sort({ tlm: -1 });
    //     if (!betaDaft || betaDaft._id != post._id) {
    //       ctx.throw(400, `您提交的内容已过期，请检查文章状态。`);
    //     }
    //   }
    // }

    // 判断前台有没有提交匿名标志，未提交则默认false
    if (
      anonymous &&
      !(await db.UserModel.havePermissionToSendAnonymousPost(
        'postToThread',
        user.uid,
        thread.mainForumsId,
      ))
    ) {
      ctx.throw(400, '你没有权限或文章所在专业不允许发表匿名内容');
    }

    const _post = await thread.newPost(post, user, ctx.address);

    // 是否需要审核
    // let needReview =
    //   await db.UserModel.contentNeedReview(user.uid, "post")  // 判断该用户是否需要审核，如果不需要审核则标记文章状态为：已审核
    //   || await db.ReviewModel.includesKeyword(_post);                // 文章内容是否触发了敏感词送审条件
    // 自动送审
    const needReview = await db.ReviewModel.getReviewStatusAndCreateLog(_post);
    if (!needReview) {
      await db.PostModel.updateOne(
        { pid: _post.pid },
        { $set: { reviewed: true } },
      );
      _post.reviewed = true;
    } else {
      // await db.MessageModel.sendReviewMessage(_post.pid);
    }

    data.post = _post;
    data.targetUser = await thread.extendUser();

    data.blacklistUsersId = await db.BlacklistModel.getBlacklistUsersId(
      data.user.uid,
    );

    // 转发到专栏
    const userColumn = await db.UserModel.getUserColumn(state.uid);
    if (columnMainCategoriesId.length > 0 && userColumn) {
      await db.ColumnPostModel.addColumnPosts(
        userColumn,
        columnMainCategoriesId,
        columnMinorCategoriesId,
        [data.thread.oc],
      );
    }

    // 发表匿名内容
    await db.PostModel.updateOne({ pid: _post.pid }, { $set: { anonymous } });

    // 生成记录
    const obj = {
      user,
      type: 'score',
      key: 'postCount',
      typeIdOfScoreChange: 'postToThread',
      tid: post.tid,
      pid: post.pid,
      ip: ctx.address,
      port: ctx.port,
    };
    await db.UsersScoreLogModel.insertLog(obj);
    obj.type = 'kcb';
    ctx.state._scoreOperationForumsId = data.thread.mainForumsId;
    await db.KcbsRecordModel.insertSystemRecord('postToThread', user, ctx);
    // await db.UsersScoreLogModel.insertLog(obj);
    //如果存在引用,回复不需要审核并且文章作者和回复作者不是同一人就通知文章作者文章被回复
    if (
      !_post.hasQuote &&
      thread.uid !== user.uid &&
      postType !== 'comment' &&
      _post.reviewed
    ) {
      const messageId = await db.SettingModel.operateSystemID('messages', 1);
      const message = await db.MessageModel({
        _id: messageId,
        r: thread.uid,
        ty: 'STU',
        c: {
          type: 'replyThread',
          targetPid: _post.pid,
          pid: thread.oc,
        },
      });
      await message.save();
      await ctx.nkcModules.socket.sendMessageToUser(message._id);
    }

    await thread.updateOne({
      $inc: [{ count: 1 }, { hits: 1 }],
      // $push: { posts: _post.pid },
    });
    if (!_post.parentPostId) {
      await thread.updateOne({
        $addToSet: { postIds: _post.pid },
      });
    }

    const type = ctx.request.accepts('json', 'html');
    await thread.updateThreadMessage();
    const newThread = await db.ThreadModel.findOnly({ tid });
    await updateCount([newThread], true);
    // 发表评论 组装评论dom 返回给前端实时显示
    if (postType === 'comment') {
      const extendPostOptions = {
        uid: data.user ? data.user.uid : '',
        visitor: data.user, // 用于渲染页面时比对学术分隐藏
      };
      let comment = await db.PostModel.findOnly({ pid: data.post.pid });
      comment = (
        await db.PostModel.extendPosts([comment], extendPostOptions)
      )[0];
      if (comment.parentPostId) {
        comment.parentPost = await db.PostModel.findOnly({
          pid: comment.parentPostId,
        });
        if (comment.parentPost.uid !== data.user.uid && comment.reviewed) {
          const message = await db.MessageModel({
            _id: await db.SettingModel.operateSystemID('messages', 1),
            r: comment.parentPost.uid,
            ty: 'STU',
            ip: ctx.address,
            port: ctx.port,
            c: {
              type: 'comment',
              pid: comment.pid,
            },
          });
          await message.save();
          await ctx.nkcModules.socket.sendMessageToUser(message._id);
        }
        data.level1Comment = comment.parentPost.parentPostId === '';
        comment.parentPost = (
          await db.PostModel.extendPosts(
            [comment.parentPost],
            extendPostOptions,
          )
        )[0];
      }
      // 修改post时间限制
      data.modifyPostTimeLimit = await db.UserModel.getModifyPostTimeLimit(
        data.user,
      );
      data.comment = comment;
      const template = Path.resolve('./pages/thread/comment.pug');
      data.html = nkcModules.render(template, data, ctx.state);
    } else if (data.post.reviewed) {
      await nkcModules.socket.sendForumMessage({
        tid: data.post.tid,
        pid: data.post.pid,
        state: ctx.state,
      });
    }
    if (type === 'html') {
      ctx.status = 303;
      return ctx.redirect(`/t/${tid}`);
    }
    // data.redirect = `/t/${thread.tid}?&pid=${_post.pid}`;
    data.redirect = await db.PostModel.getUrl(_post.pid, true);
    // 如果是编辑的草稿，则删除草稿
    // if(did) {
    //   await db.DraftModel.removeDraftById(did, data.user.uid);
    // }
    // 发布后编辑版改为发布历史版
    // if (post._id) {
    //   db.DraftModel.updateToStableHistoryById(post._id, state.uid);
    // }
    if (post._id || did) {
      const draftDid =
        did ||
        (
          await db.DraftModel.findOnly(
            { _id: new ObjectId(post._id) },
            { did: 1 },
          )
        ).did;
      if (draftDid) {
        const beta = (await db.DraftModel.getType()).beta;
        const betaDaft = await db.DraftModel.findOne({
          did: draftDid,
          type: beta,
          uid: state.uid,
        }).sort({ tlm: -1 });
        if (betaDaft) {
          const stableHistory = (await db.DraftModel.getType()).stableHistory;
          await betaDaft.updateOne({
            $set: {
              type: stableHistory,
              tlm: Date.now(),
            },
          });
        }
      }
    }
    // 推送回复、评论 仅推送无需审核的post
    if (_post.reviewed) {
      await nkcModules.socket.sendPostMessage(_post.pid);
    } else {
      // 若post需要审核则将渲染好的内容返回
      const singlePostData = await db.PostModel.getSocketSinglePostData(
        _post.pid,
      );
      data.renderedPost = {
        postId: _post.pid,
        html: singlePostData.html,
        parentPostId: singlePostData.parentPostId,
        parentCommentId: singlePostData.parentCommentId,
      };
    }
    //如果不是匿名发表并且不需要审核就生成一条新的动态
    if (!_post.anonymous && _post.reviewed) {
      // 生成动态
      const momentQuoteTypes = await db.MomentModel.getMomentQuoteTypes();
      db.MomentModel.createQuoteMomentAndPublish({
        ip: ctx.address,
        port: ctx.port,
        uid: _post.uid,
        quoteType: momentQuoteTypes.post,
        quoteId: _post.pid,
      }).catch((err) => {
        console.error(err);
      });
    }
    await next();
  })
  .put('/:tid/post-order', OnlyUnbannedUser(), async (ctx, next) => {
    const { db, body, state, params } = ctx;
    const { postIdsOrder = [], type } = body;
    const { tid } = params;
    const { uid } = state;
    //判断用户是否具有编辑文章回复顺序的权限
    await db.ForumModel.checkEditPostPositionInRoute({
      uid,
      tid,
      isAdmin: ctx.permission('modifyAllPostOrder'),
    });
    const thread = await db.ThreadModel.findOnly(
      { tid },
      { postIds: 1, uid: 1 },
    );
    //回复顺序的操作状态
    const status = await db.ThreadModel.getOrderStatus();
    //执行拖拽的时候
    if (postIdsOrder.length !== 0 && type === 'saveOrder') {
      const orderStatus = thread.uid === uid ? status.author : status.admin;
      const { postIds } = thread;
      const newPostIds = [...postIds].sort((a, b) => {
        const indexA = postIdsOrder.indexOf(a);
        const indexB = postIdsOrder.indexOf(b);
        // 如果 a 或 b 不在 arr2 中，保持原始顺序
        if (indexA === -1 || indexB === -1) {
          return 0;
        }
        return indexA - indexB;
      });

      await db.ThreadModel.findOneAndUpdate(
        {
          tid,
        },
        { $set: { postIds: newPostIds, orderStatus } },
      );
    }
    //恢复默认排序的时候
    if (type === 'reOrder') {
      const posts = await db.PostModel.find(
        { tid, type: 'post', parentPostId: '' },
        { pid: 1 },
      ).sort({ toc: 1 });
      const postIds = posts.map((post) => {
        return post.pid;
      });
      await db.ThreadModel.updateOne(
        { tid },
        {
          $set: { postIds, orderStatus: status.default },
        },
      );
    }
    await next();
  })
  //.use('/:tid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:tid/ad', adRouter.routes(), adRouter.allowedMethods())
  .use('/:tid/hometop', homeTopRouter.routes(), homeTopRouter.allowedMethods())
  .use('/:tid/topped', toppedRouter.routes(), toppedRouter.allowedMethods())
  .use('/:tid/block', blockRouter.routes(), blockRouter.allowedMethods())
  .use('/:tid/close', closeRouter.routes(), closeRouter.allowedMethods())
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;
