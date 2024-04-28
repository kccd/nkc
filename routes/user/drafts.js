const Router = require('koa-router');
const customCheerio = require('../../nkcModules/nkcRender/customCheerio');
const draftsRouter = new Router();
draftsRouter
  .get('/', async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    const { user } = data;
    const { page = 0, id } = query;
    const draftDesType = await db.DraftModel.getDesType();
    const count = await db.DraftModel.countDocuments({ uid: user.uid });
    const paging = nkcModules.apiFunction.paging(page, count);
    const drafts = await db.DraftModel.find({ uid: user.uid })
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.paging = paging;
    data.drafts = [];
    for (const draft of drafts) {
      const { desType, desTypeId } = draft;
      const d = draft.toObject();
      // if(desType === "forum") {
      if (desType === draftDesType.newThread) {
        d.type = 'newThread';
      } else if (desType === draftDesType.newPost) {
        d.type = 'newPost';
        const thread = await db.ThreadModel.findOne({ tid: desTypeId });
        if (!thread) {
          continue;
        }
        const firstPost = await db.PostModel.findOne({ pid: thread.oc });
        d.thread = {
          url: `/t/${thread.tid}`,
          title: firstPost.t,
        };
      } else if (desType === draftDesType.modifyThread) {
        const thread = await db.ThreadModel.findOne({ tid: post.tid });
        if (!thread) {
          continue;
        }
        d.thread = {
          url: `/t/${thread.tid}`,
          title: post.t,
        };
        d.type = 'modifyThread';
      } else if (desType === draftDesType.modifyPost) {
        const post = await db.PostModel.findOne({ pid: desTypeId });
        if (!post) {
          continue;
        }
        const thread = await db.ThreadModel.findOne({ tid: post.tid });
        if (!thread) {
          continue;
        }
        const firstPost = await db.PostModel.findOne({ pid: thread.oc });
        const url = await db.PostModel.getUrl(post.pid);
        d.thread = {
          url,
          title: firstPost.t,
        };
        d.type = 'modifyPost';
      }
      /* else if(desType === "post") {
        const post = await db.PostModel.findOne({pid: desTypeId});
        if (!post) continue;
        const thread = await db.ThreadModel.findOne({tid: post.tid});
        if (!thread) continue;
        if (post.pid === thread.oc) {
          d.thread = {
            url: `/t/${thread.tid}`,
            title: post.t
          };
          d.type = "modifyThread";
        } else {
          const firstPost = await db.PostModel.findOne({pid: thread.oc});
          const url = await db.PostModel.getUrl(post.pid);
          d.thread = {
            url,
            title: firstPost.t
          };
          d.type = "modifyPost";
        }
      } */
      /* else {
        if(desType === 'forumDeclare') {
          d.type = 'modifyForumDeclare';
        } else {
          d.type ='modifyForumLatestNotice';
        }
        const forum = await db.ForumModel.findOne({fid: desTypeId});
        if(!forum) continue;
        d.forum = {
          title: forum.displayName,
          url: `/f/${forum.fid}`
        };
      } */
      d.c = nkcModules.apiFunction.obtainPureText(d.c, true, 300);
      data.drafts.push(d);
    }
    ctx.template = 'user/drafts/drafts.pug';
    await next();
  })
  .del('/:did', async (ctx, next) => {
    const { db, data, params } = ctx;
    const { user } = data;
    let { did } = params;
    let drafts = [];
    if (did === 'all') {
      drafts = await db.DraftModel.find({ uid: user.uid });
    } else {
      did = did.split('-');
      did = did.filter((d) => !!d);
      drafts = await db.DraftModel.find({ did: { $in: did }, uid: user.uid });
    }
    for (const d of drafts) {
      await db.DraftModel.removeDraftById(d.did, user.uid);
    }
    await next();
  })
  // 保存草稿
  .post('/', async (ctx, next) => {
    const { data, db, nkcModules } = ctx;
    const { user } = data;
    const draftCount = await db.DraftModel.countDocuments({ uid: user.uid });
    // 后期需要完善
    if (draftCount >= 5000) {
      ctx.throw(400, '草稿箱已满');
    }
    const draftDesType = await db.DraftModel.getDesType();
    let body, files;
    if (ctx.body.fields) {
      body = JSON.parse(ctx.body.fields.body);
      files = ctx.body.files;
    } else {
      body = ctx.body;
    }
    const {
      post, // 草稿内容
      desType, // 草稿类型
      desTypeId, // 草稿类型对应的ID
      draftId, // 草稿ID
      saveType,
    } = body;
    if (
      ![
        'newThread',
        'modifyThread',
        'newPost',
        'modifyPost',
        'newComment',
        'modifyComment',
      ].includes(desType)
    ) {
      ctx.throw(500, '草稿类型错误');
    }
    let {
      t = '',
      c = '',
      l = 'html',
      abstractEn = '',
      abstractCn = '',
      keyWordsEn = [],
      keyWordsCn = [],
      fids = [],
      cids = [],
      authorInfos = [],
      originState = 0,
      anonymous = false,
      cover = '',
      survey,
      parentPostId = '',
      tcId = [],
      noticeContent,
      checkNewNotice,
    } = post;
    // 检查草稿
    const _content = customCheerio.load(c).text();
    if (_content && _content.length > 100000) {
      ctx.throw(400, `内容不能超过10万字`);
    }
    if (_content && _content.length < 500 && originState !== 0) {
      ctx.throw(400, `字数小于500的文章无法声明原创`);
    }
    nkcModules.checkData.checkString(c, {
      name: '内容',
      minLength: 0,
      maxLength: 2000000,
    });
    let draft;
    let contentLength;
    if (parentPostId) {
      const parentPost = await db.PostModel.findOnly({ pid: parentPostId });
      if (!parentPost) {
        ctx.throw(400, 'parentPostId不存在');
      }
    }
    const draftTypes = await db.DraftModel.getType();
    if (draftId) {
      draft = await db.DraftModel.findOne({
        did: draftId,
        uid: user.uid,
        type: draftTypes.beta,
      }).sort({ tlm: -1 });
      if (!draft) {
        ctx.throw(400, `文章已经发布或已经为历史版`);
      }
    }
    const draftObj = {
      t,
      c,
      l,
      abstractEn,
      abstractCn,
      keyWordsEn,
      keyWordsCn,
      tcId,
      mainForumsId: fids,
      categoriesId: cids,
      cover,
      authorInfos,
      originState,
      anonymous,
      parentPostId,
      noticeContent,
      checkNewNotice,
      tlm: Date.now(),
    };
    if (draft) {
      // 存在草稿
      // 更新草稿
      await draft.updateOne(draftObj);
      draft = await db.DraftModel.findOne({
        did: draftId,
        uid: user.uid,
        type: draftTypes.beta,
      }).sort({ tlm: -1 });
      if (saveType === 'timing') {
        // 定时保存
        await draft.checkContentAndCopyToBetaHistory();
      } else if (saveType === 'manual') {
        // 手动保存
        await draft.copyToBetaHistory();
      }
      if (survey) {
        // 调查表数据
        if (draft.surveyId) {
          // 若草稿上已有调查表ID，则只需更新调查表数据。
          survey._id = draft.surveyId;
          await db.SurveyModel.modifySurvey(survey, false);
        } else {
          // 若草稿上没有调查表数据，则创建调查表。
          survey.uid = user.uid;
          const surveyDB = await db.SurveyModel.createSurvey(survey, false);
          await draft.updateOne({ surveyId: surveyDB._id });
        }
      }
      // else if(desType === "forum" && draft.surveyId) { // 只有在发表新帖的时候可以取消创建调查表，其他情况不允许取消。
      else if (desType === draftDesType.newThread && draft.surveyId) {
        // 只有在发表新帖的时候可以取消创建调查表，其他情况不允许取消。
        await draft.updateOne({ surveyId: null });
        await db.SurveyModel.deleteOne({ uid: user.uid, _id: draft.surveyId });
      }
    } else {
      // "forumDeclare", 'forumLatestNotice'
      // if(!["forum", "thread", "post"].includes(desType)) ctx.throw(400, `未知的草稿类型：${desType}`);
      if (!Object.values(draftDesType).includes(desType)) {
        ctx.throw(400, `未知的草稿类型：${desType}`);
      }

      // if(desType === "thread") {
      //   await db.ThreadModel.findOnly({tid: desTypeId});
      // } else if(desType === "post") {
      //   await db.PostModel.findOnly({pid: desTypeId});
      // }
      // else if(["forumDeclare", 'forumLatestNotice'].includes(desType)) {
      //   await db.ForumModel.findOnly({fid: desTypeId});
      // }
      draftObj.desTypeId = desTypeId;
      draftObj.desType = desType;
      draftObj.uid = user.uid;
      draftObj.did = await db.SettingModel.operateSystemID('drafts', 1);
      draft = db.DraftModel(draftObj);
      await draft.save();
      if (survey) {
        survey.uid = user.uid;
        const surveyDB = await db.SurveyModel.createSurvey(survey, false);
        await draft.updateOne({ surveyId: surveyDB._id });
      }
    }
    if (files && files.postCover) {
      await db.AttachmentModel.saveDraftCover(draft.did, files.postCover);
      // await nkcModules.file.saveDraftCover(draft.did, files.postCover);
    }
    if (draft) {
      const oldDraft = await db.DraftModel.findOne({
        did: draft.did,
        uid: user.uid,
      });
      contentLength = oldDraft.c.length;
    } else {
      contentLength = post.c.length;
    }
    // 将数据库中的内容长度发送给前端，用于内容减少时提示用户是否需要保存
    data.contentLength = contentLength;
    data.draft = await db.DraftModel.findOne({ _id: draft._id, uid: user.uid });
    await next();
  });
/*.post('/', async(ctx, next) => {
    const data = ctx.data;
    const db = ctx.db;
    const body = ctx.body.post;

    //获取该uid下草稿数量
    const draftcount = await db.DraftModel.find({"uid":ctx.data.user.uid});

    //判断当前草稿是否为重新编辑，是则更新
    const newSingleDraft = await db.DraftModel.find({"uid": ctx.data.user.uid,"did":body.did})
    if(newSingleDraft.length === 0){
        if(draftcount.length >= 100){
            ctx.throw(403, "草稿箱已满！")
        }
        let newId = await db.SettingModel.operateSystemID('drafts', 1);
        if(!body.desType || body.desType === "redit") {
          body.desType = "forum";
          body.desTypeId = "";
        }
        let newDraft = db.DraftModel({
          l: body.l,
          t: body.t,
          c: body.c,
          uid: ctx.data.user.uid,
          did: newId,
          anonymous: body.anonymous,
          desType: body.desType,
          desTypeId: body.desTypeId,
          abstractCn: body.abstractCn,
          abstractEn: body.abstractEn,
          authorInfos: body.authorInfos,
          keyWordsCn: body.keyWordsCn,
          keyWordsEn: body.keyWordsEn,
          originState: body.originState
        });
        await newDraft.save();
        data.status = "success"
        data.did = newId
    }else{
        let datestr = Date.now()
        const toeditdraft = await db.DraftModel.findOnly({did:body.did});
        await toeditdraft.updateOne({t:body.t,c:body.c,tlm:datestr,abstractCn: body.abstractCn, abstractEn: body.abstractEn, authorInfos:body.authorInfos, keyWordsCn: body.keyWordsCn, keyWordsEn: body.keyWordsEn, originState: body.originState});
        // await db.DraftModel.updateOne({t:body.t},{$set: {c:body.c,toc:datestr}});
        data.status = "success";
        data.did = body.did
    }
    await next()
  });*/
module.exports = draftsRouter;
