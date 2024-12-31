const Router = require('koa-router');
const quote = require('./quote');
const history = require('./history');
const credit = require('./credit');
const digestRouter = require('./digest');
const voteRouter = require('./vote');
const warningRouter = require('./warning');
const anonymousRouter = require('./anonymous');
const hideRouter = require('./hide');
const toppedRouter = require('./topped');
const authorRouter = require('./author');
const resourcesRouter = require('./resources');
const optionRouter = require('./option');
const commentsRouter = require('./comments');
const commentRouter = require('./comment');
const collectionRouter = require('./collection');
const router = new Router();
const customCheerio = require('../../nkcModules/nkcRender/customCheerio');
const {
  sensitiveDetectionService,
} = require('../../services/sensitive/sensitiveDetection.service');
const noticeRouter = require('./notice');
const noticesRouter = require('./notices');
const { checkString } = require('../../nkcModules/checkData');
const { renderHTMLByJSON } = require('../../nkcModules/nkcRender/json');
const { Public, OnlyUnbannedUser } = require('../../middlewares/permission');
router
  .use('/', Public(), async (ctx, next) => {
    const { state, data, db } = ctx;
    await db.ForumModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .get('/:pid', Public(), async (ctx, next) => {
    // 设置 referer 策略
    // 解决分享回复时附件链接跨域无法读取referer中token的问题
    ctx.set('Referrer-Policy', 'unsafe-url');
    await next();
  })
  .get('/:pid', Public(), async (ctx, next) => {
    const { nkcModules, data, db, query, state } = ctx;
    const { token, page = 0, highlight, redirect } = query;
    const { pid } = ctx.params;
    data.highlight = highlight;
    data.page = page;
    const post = await db.PostModel.findOnly({ pid });
    if (redirect === 'true') {
      const url = await db.PostModel.getUrl(post.pid, true);
      return ctx.redirect(url);
    }
    if (data.user) {
      await data.user.extendAuthLevel();
    }
    data.authorAccountRegisterInfo = await db.UserModel.getAccountRegisterInfo({
      uid: post.uid,
      ipId: post.ip,
    });
    const thread = await post.extendThread();
    // 屏蔽公告权限
    const shieldNotice = ctx.permission('disablePostNotice');
    // 编辑公告权限
    const canEditNotice =
      post.uid === state.uid || ctx.permission('disablePostNotice');
    const noticeMatch = { pid: pid, status: 'normal' };
    if (shieldNotice || post.uid === state.uid) {
      noticeMatch.status = { $in: ['normal', 'shield'] };
    }
    const notices = await db.NewNoticesModel.find(noticeMatch)
      .sort({ toc: -1 })
      .lean();
    // 查看详情历史权限
    let postHistory = null;
    if (notices.length !== 0) {
      const isExpert = await db.PostModel.isModerator(state.uid, pid);
      if (
        post.tlm > post.toc &&
        ctx.permission('visitPostHistory') &&
        isExpert
      ) {
        postHistory =
          !post.hideHistories || ctx.permission('displayPostHideHistories')
            ? true
            : null;
      }
      const userId = Array.from(new Set(notices.map((item) => item.uid)));
      //获取公告用户信息
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
        { pid, cv: { $in: cv } },
        { _id: 1, cv: 1 },
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
            avatar: nkcModules.tools.getUrl('userAvatar', user.avatar),
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
          };
        },
      );
      data.shieldNotice = shieldNotice;
      data.canEditNotice = canEditNotice;
      data.postHistory = postHistory;
    }
    await thread.extendFirstPost();
    data.thread = {
      tid: thread.tid,
      oc: thread.oc,
      firstPost: {
        t: thread.firstPost.t,
      },
    };
    data.creditScore = await db.SettingModel.getScoreByOperationType(
      'creditScore',
    );
    if (data.user) {
      data.digestRewardScore = await db.SettingModel.getScoreByOperationType(
        'digestRewardScore',
      );
      data.creditScore = await db.SettingModel.getScoreByOperationType(
        'creditScore',
      );
      data.creditSettings = await db.SettingModel.getCreditSettings();
    }
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    const { user } = data;
    let isModerator = ctx.permission('superModerator');
    if (!isModerator) {
      for (const f of forums) {
        isModerator = await f.isModerator(data.user ? data.user.uid : '');
        if (isModerator) {
          break;
        }
      }
    }
    // 判断用户是否具有访问该post所在文章的权限
    data.isModerator = isModerator;

    if (!thread.reviewed) {
      if (!data.user || (!isModerator && data.user.uid !== thread.uid)) {
        ctx.throw(403, '文章还未通过审核，暂无法阅读');
      }
    }
    if (!post.reviewed) {
      if (!data.user || (!isModerator && data.user.uid !== post.uid)) {
        ctx.throw(403, '回复还未通过审核，暂无法阅读');
      }
    }

    const options = {
      roles: data.userRoles,
      grade: data.userGrade,
      isModerator,
      userOperationsId: data.userOperationsId,
      user,
    };
    await db.SettingModel.restrictAccess({
      toc: post.toc,
      forums: forums,
      isAuthor: state.uid && state.uid === post.uid,
      userRolesId: data.userRoles.map((role) => role._id),
      userGradeId: data.userGrade._id,
    });
    if (!(await db.ShareModel.hasPermission(token, pid))) {
      await post.ensurePermission(options);
    }
    // await post.ensurePermissionNew(options);
    // 拓展其他信息
    // await post.extendUser();
    // await post.extendResources();
    const extendPostOptions = {
      uid: data.user ? data.user.uid : '',
      visitor: data.user,
    };
    data.post = await db.PostModel.extendPost(post, extendPostOptions);
    data.postUrl = await db.PostModel.getUrl(data.post);
    const { post: postSource } = await db.PostsVoteModel.getVoteSources();
    const voteUp = await db.PostsVoteModel.find({
      source: postSource,
      sid: pid,
      type: 'up',
    }).sort({ toc: 1 });
    const uid = new Set();
    for (const v of voteUp) {
      uid.add(v.uid);
    }
    const users = await db.UserModel.find({ uid: { $in: [...uid] } });
    const usersObj = {};
    for (const u of users) {
      usersObj[u.uid] = u;
    }
    data.voteUpUsers = [];
    if (state.uid) {
      for (const v of voteUp) {
        data.voteUpUsers.push(usersObj[v.uid]);
      }
    }

    if (!data.post.anonymous) {
      data.post.user = await db.UserModel.findOnly({ uid: post.uid });
      await db.UserModel.extendUsersInfo([data.post.user]);
      await data.post.user.extendGrade();
    }
    data.redEnvelopeSettings = await db.SettingModel.getSettings('redEnvelope');
    data.kcbSettings = await db.SettingModel.getSettings('kcb');
    data.xsfSettings = await db.SettingModel.getSettings('xsf');
    // 读取帖子设置是因为页面读取了这里面的视频遮罩设置
    data.threadSettings = await db.SettingModel.getSettings('thread');
    ctx.template = 'post/post.pug';

    if (data.user) {
      data.complaintTypes = ctx.state.language.complaintTypes;
      data.blacklistUsersId = await db.BlacklistModel.getBlacklistUsersId(
        data.user.uid,
      );
    }

    if (ctx.permission('viewNote')) {
      data.notes = await db.NoteModel.getNotesByPosts([
        {
          pid: data.post.pid,
          cv: data.post.cv,
        },
      ]);
    }
    await next();
  })
  .put('/:pid', OnlyUnbannedUser(), async (ctx, next) => {
    let body,
      files = {};
    if (ctx.body.fields) {
      body = JSON.parse(ctx.body.fields.body);
      files = ctx.body.files;
    } else {
      body = ctx.body;
    }
    const post = body.post;
    const {
      columnMainCategoriesId = [],
      columnMinorCategoriesId = [],
      anonymous,
      t,
      c,
      abstractCn,
      abstractEn,
      keyWordsCn,
      keyWordsEn,
      authorInfos = [],
      originState,
      survey,
      did,
      cover = '',
      noticeContent,
      _id,
      type,
      l,
    } = post;
    const { pid } = ctx.params;
    const { state, data, db, nkcModules } = ctx;
    const { user } = data;
    // const authLevel = await user.extendAuthLevel();
    // if(authLevel < 1) ctx.throw(403,'您的账号还未实名认证，请前往账号安全设置处绑定手机号码。');
    // if(!user.volumeA) ctx.throw(403, '您还未通过A卷考试，未通过A卷考试不能发表回复。');
    if (!c) {
      ctx.throw(400, '参数不正确');
    }
    const targetPost = await db.PostModel.findOnly({ pid });
    const _targetPost = targetPost.toObject();
    const targetThread = await targetPost.extendThread();

    if (targetThread.oc === pid) {
      if (t.length < 3) {
        ctx.throw(400, `标题不能少于3个字`);
      }
      if (t.length > 100) {
        ctx.throw(400, `标题不能超过100个字`);
      }
    }

    const content =
      l === 'json'
        ? customCheerio.load(renderHTMLByJSON({ json: c })).text()
        : customCheerio.load(c).text();

    if (content.length < 2) {
      ctx.throw(400, `内容不能少于2个字`);
    }
    // 字数限制
    if (targetPost.parentPostId) {
      // 作为评论 不能超过200字
      if (content.length > 200) {
        ctx.throw(400, `内容不能超过200字`);
      }
    } else {
      // 作为文章、回复 不能超过10万字
      if (content.length > 100000) {
        ctx.throw(400, `内容不能超过10万字`);
      }
    }
    nkcModules.checkData.checkString(c, {
      name: '内容',
      minLength: 1,
      maxLength: 2000000,
    });

    nkcModules.checkData.checkString(
      JSON.stringify({
        columnMainCategoriesId,
        columnMinorCategoriesId,
        anonymous,
        t,
        c,
        abstractCn,
        abstractEn,
        keyWordsCn,
        keyWordsEn,
        authorInfos,
        originState,
      }),
      {
        name: '内容',
        minLength: 1,
        maxLength: 2000000,
      },
    );
    // if (_id) {
    //   const draftDid =
    //     did ||
    //     (await db.DraftModel.findOnly({ _id: new ObjectId(_id) }, { did: 1 })).did;
    //   if (draftDid) {
    //     const beta = (await db.DraftModel.getType()).beta;
    //     const betaDaft = await db.DraftModel.findOne({
    //       did: draftDid,
    //       type: beta,
    //       uid: state.uid,
    //     }).sort({ tlm: -1 });
    //     if (!betaDaft || betaDaft._id != _id) {
    //       ctx.throw(400, `您提交的内容已过期，请检查文章状态。`);
    //     }
    //   }
    // }

    const targetForums = await targetThread.extendForums(['mainForums']);
    let isModerator;
    for (let targetForum of targetForums) {
      isModerator = await targetForum.isModerator(user.uid);
      if (isModerator) {
        break;
      }
    }
    // const isModerator = await targetForum.isModerator(user.uid);
    // 权限判断
    if (!data.userOperationsId.includes('modifyOtherPosts') && !isModerator) {
      if (user.uid !== targetPost.uid) {
        ctx.throw(403, '您没有权限修改别人的回复');
      }
      if (targetPost.disabled && !targetPost.toDraft) {
        ctx.throw(403, '回复已被屏蔽，暂不能修改');
      }
    }
    if (targetThread.oc === pid && targetThread.type === 'fund') {
      ctx.throw(403, '无法编辑科创基金类文章');
    }
    if (targetThread.oc === pid && !t) {
      ctx.throw(400, '标题不能为空!');
    }
    const targetUser = await targetPost.extendUser();

    if (targetThread.type !== 'product') {
      // 修改回复的时间限制
      let modifyPostTimeLimit = 0;
      for (const r of data.userRoles) {
        if (r.modifyPostTimeLimit === -1) {
          modifyPostTimeLimit = -1;
          break;
        }
        if (r.modifyPostTimeLimit > modifyPostTimeLimit) {
          modifyPostTimeLimit = r.modifyPostTimeLimit;
        }
      }
      if (
        modifyPostTimeLimit !== -1 &&
        Date.now() - targetPost.toc.getTime() >
          modifyPostTimeLimit * 60 * 60 * 1000
      ) {
        ctx.throw(403, `您只能需改${modifyPostTimeLimit}小时前发表的内容`);
      }
    }

    // 生成历史记录
    await db.HistoriesModel.createHistory(_targetPost);

    // 判断文本是否有变化，有变化版本号加1
    /*if(c !== targetPost.c) {
      targetPost.cv ++;
    }*/
    targetPost.uidlm = user.uid;
    targetPost.iplm = await db.IPModel.saveIPAndGetToken(ctx.address);
    targetPost.t = t;
    targetPost.c = c;
    targetPost.cover = cover;
    targetPost.abstractCn = abstractCn;
    targetPost.abstractEn = abstractEn;
    targetPost.keyWordsCn = keyWordsCn;
    targetPost.keyWordsEn = keyWordsEn;
    const postType =
      targetPost.pid === targetThread.oc ? 'postToForum' : 'postToThread';
    if (anonymous !== undefined && anonymous) {
      if (
        await db.UserModel.havePermissionToSendAnonymousPost(
          postType,
          user.uid,
          targetPost.mainForumsId,
        )
      ) {
        if (
          postType !== 'postToForum' ||
          !['product', 'fund'].includes(targetThread.type)
        ) {
          targetPost.anonymous = true;
        } else {
          ctx.throw(400, '基金类文章和商品类文章不允许匿名发表');
        }
      } else {
        ctx.throw(400, '您没有权限或专业不予许发表匿名内容');
      }
    } else {
      targetPost.anonymous = false;
    }
    // 修改调查表
    if (survey && targetPost.surveyId) {
      survey.mid = data.user.uid;
      if (targetThread.oc === pid) {
        survey.postType = 'thread';
      } else {
        survey.postType = 'post';
      }
      await db.SurveyModel.modifySurvey(survey);
    }
    let newAuthInfos = [];
    for (let a = 0; a < authorInfos.length; a++) {
      if (authorInfos[a].name.length > 0) {
        newAuthInfos.push(authorInfos[a]);
      } else {
        let kcUser = await db.UserModel.findOne({ uid: authorInfos[a].kcid });
        if (kcUser) {
          authorInfos[a].name = kcUser.username;
          newAuthInfos.push(authorInfos[a]);
        }
      }
    }
    targetPost.authorInfos = newAuthInfos;
    targetPost.originState = originState;
    targetPost.tlm = Date.now();
    targetPost.toDraft = false;
    if (targetThread.oc === pid) {
      targetPost.cover = cover;
    }
    // targetPost.rpid = rpid;
    const q = {
      tid: targetThread.tid,
    };
    await targetPost.save();

    if (targetThread.oc === pid && files && files.postCover) {
      await db.AttachmentModel.savePostCover(pid, files.postCover);
      // await ctx.nkcModules.file.savePostCover(pid, files.postCover);
    }
    if (
      !isModerator &&
      !data.userOperationsId.includes('displayDisabledPosts')
    ) {
      q.disabled = false;
    }
    // 转发到专栏
    const userColumn = await db.UserModel.getUserColumn(state.uid);
    if (columnMainCategoriesId.length > 0 && userColumn) {
      await db.ColumnPostModel.addColumnPosts(
        userColumn,
        columnMainCategoriesId,
        columnMinorCategoriesId,
        [targetThread.oc],
      );
    }
    data.redirect = await db.PostModel.getUrl(pid);
    data.targetUser = targetUser;
    // 帖子再重新发表时，解除退回的封禁
    // 删除日志中modifyType改为true
    const delPostLog = await db.DelPostLogModel.find({
      postId: pid,
      modifyType: false,
    });
    for (const log of delPostLog) {
      await log.updateOne({ modifyType: true });
    }
    // 若post被退修则清除退修标记并标记为未审核
    const isThreadContent = targetThread.oc === targetPost.pid;
    if (isThreadContent) {
      if (targetThread.recycleMark) {
        await targetThread.updateOne({
          recycleMark: false,
          reviewed: false,
        });
        await targetPost.updateOne({
          reviewed: false,
        });
      }
    }
    // 在post中找到这一条数据，并解除屏蔽
    const singlePost = await db.PostModel.findOnly({ pid });
    let postReviewed = singlePost.reviewed;
    if (singlePost.disabled && singlePost.toDraft) {
      await singlePost.updateOne({
        disabled: false,
        reviewed: false,
      });
      postReviewed = false;
    }

    // 如果符合送审条件，自动内容送审
    const needReview = await db.ReviewModel.autoPushToReview(singlePost);
    if (needReview) {
      await singlePost.updateOne({
        reviewed: false,
      });
      if (isThreadContent) {
        await db.ThreadModel.updateOne(
          { tid: singlePost.tid },
          {
            $set: {
              reviewed: false,
            },
          },
        );
      }
    }
    // 如果有文章新通告就生成新通告记录表
    if (noticeContent) {
      // 检测是否有发布回复公告或回复公告的权限
      const checkObj = { uid: state.uid, id: pid };
      if (type === 'modifyPost') {
        checkObj.type = 'post';
      } else if (type === 'modifyThread') {
        checkObj.type = 'thread';
      }
      await db.ForumModel.checkPublishNoticeInRoute(checkObj);
      //检测文章通告内容是否有敏感词
      await sensitiveDetectionService.threadNoticeDetection(noticeContent);
      //检测文章通告内容是否超过字数限制
      checkString(noticeContent, { minTextLength: 5, maxTextLength: 200 });
      const { cv } = await db.PostModel.findOnly({ pid }, { cv: 1 });

      let noticeObj = { pid, uid: state.uid, noticeContent, cv };
      //存储文章通告数据
      await db.NewNoticesModel.extendNoticeContent(noticeObj);
    }

    await targetThread.updateThreadMessage(false);

    // 帖子曾经在草稿箱中，发表时，删除草稿
    // if(did) {
    //   await db.DraftModel.removeDraftById(did, data.user.uid);
    // }
    // if (_id) {
    //   const beta = (await db.DraftModel.getType()).beta;
    //   const stableHistory = (await db.DraftModel.getType()).stableHistory;
    //   const res = await db.DraftModel.updateOne(
    //     { _id: new ObjectId(_id), uid: data.user.uid, type: beta },
    //     {
    //       $set: {
    //         type: stableHistory,
    //         tlm: Date.now(),
    //       },
    //     },
    //   );
    // }
    if (did) {
      const beta = (await db.DraftModel.getType()).beta;
      const betaDaft = await db.DraftModel.findOne({
        did,
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
    await targetUser.updateUserMessage();
    // if(!postReviewed) {
    // await db.MessageModel.sendReviewMessage(singlePost.pid);
    // }
    await next();
  })
  .use('/:pid/hide', hideRouter.routes(), hideRouter.allowedMethods())
  .use('/:pid/history', history.routes(), history.allowedMethods())
  .use('/:pid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:pid/credit', credit.routes(), credit.allowedMethods())
  .use('/:pid/vote', voteRouter.routes(), voteRouter.allowedMethods())
  .use('/:pid/warning', warningRouter.routes(), warningRouter.allowedMethods())
  .use('/:pid/author', authorRouter.routes(), authorRouter.allowedMethods())
  .use('/:pid/quote', quote.routes(), quote.allowedMethods())
  .use('/:pid/topped', toppedRouter.routes(), toppedRouter.allowedMethods())
  .use(
    '/:pid/anonymous',
    anonymousRouter.routes(),
    anonymousRouter.allowedMethods(),
  )
  .use(
    '/:pid/resources',
    resourcesRouter.routes(),
    resourcesRouter.allowedMethods(),
  )
  .use(
    '/:pid/collection',
    collectionRouter.routes(),
    collectionRouter.allowedMethods(),
  )
  .use('/:pid/option', optionRouter.routes(), optionRouter.allowedMethods())
  .use(
    '/:pid/comments',
    commentsRouter.routes(),
    commentsRouter.allowedMethods(),
  )
  .use('/:pid/comment', commentRouter.routes(), commentRouter.allowedMethods())
  .use('/:pid/notice', noticeRouter.routes(), noticeRouter.allowedMethods())
  .use('/:pid/notices', noticesRouter.routes(), noticesRouter.allowedMethods());

module.exports = router;
