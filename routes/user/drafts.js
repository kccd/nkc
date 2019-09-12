const Router = require('koa-router');
const draftsRouter = new Router();
draftsRouter
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {user} = data;
    const {page = 0} = query;
    const count = await db.DraftModel.count({uid: user.uid});
    const paging = nkcModules.apiFunction.paging(page, count);
    const drafts = await db.DraftModel.find({uid: user.uid}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.paging = paging;
    data.drafts = [];
    for(const draft of drafts) {
      const {desType, desTypeId} = draft;
      const d = draft.toObject();
      if(desType === "forum") {
        d.type = "newThread";
      } else if(desType === "thread") {
        d.type = "newPost";
        const thread = await db.ThreadModel.findOne({tid: desTypeId});
        if(!thread) continue;
        const firstPost = await db.PostModel.findOne({pid: thread.oc});
        d.thread = {
          url: `/t/${thread.tid}`,
          title: firstPost.t
        };
      } else if(desType === "post") {
        const post = await db.PostModel.findOne({pid: desTypeId});
        if(!post) continue;
        const thread = await db.ThreadModel.findOne({tid: post.tid});
        if(!thread) continue;
        if(post.pid === thread.oc) {
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
      } else {
        d.type = "modifyForumDeclare";
        const forum = await db.ForumModel.findOne({fid: desTypeId});
        if(!forum) continue;
        d.forum = {
          title: forum.displayName,
          url: `/f/${forum.fid}`
        };
      }
      d.c = nkcModules.apiFunction.obtainPureText(d.c, true, 300);
      data.drafts.push(d);
    }
    ctx.template = 'user/drafts/drafts.pug';
    await next()
  })
  .del('/:did', async(ctx, next) => {
    const {db, data, params} = ctx;
    const {user} = data;
    const {did} = params;
    if(did === "all") {
      await db.DraftModel.remove({uid: user.uid});
    } else {
      const draft = await db.DraftModel.findOne({uid: user.uid, did});
      if(!draft) ctx.throw(400, "草稿不存在，请刷新");
      await draft.remove();
    }
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {
      post, // 草稿内容
      desType, // 草稿类型
      desTypeId, // 草稿类型对应的ID
      draftId, // 草稿ID
      survey, // 调查表
    } = body;
    let {
      t = "", c = "", l = "html", abstractEn = "", abstractCn = "",
      keyWordsEn = [], keyWordsCn = [], fids = [], cids = [],
      authorInfos = [], originState = 0, anonymous = false, surveyId = null
    } = post;
    const {user} = data;
    const draftCount = await db.DraftModel.count({uid: user.uid});
    if(draftCount >= 100) ctx.throw(400, "草稿箱已满，保存草稿失败");
    let draft;
    if(draftId) {
      draft = await db.DraftModel.findOne({did: draftId});
    }
    const draftObj = {
      t, c, l, abstractEn, abstractCn, keyWordsEn, keyWordsCn,
      mainForumsId: fids,
      categoriesId: cids,
      authorInfos, originState, anonymous, surveyId
    };
    if(draft) {
      draftObj.tlm = Date.now();
      await draft.update(draftObj);
    } else {
      if(!["forum", "thread", "post", "forumDeclare"].includes(desType)) ctx.throw(400, `未知的草稿类型：${desType}`);
      if(desType === "thread") {
        await db.ThreadModel.findOnly({tid: desTypeId});
      } else if(desType === "post") {
        await db.PostModel.findOnly({pid: desTypeId});
      } else if(desType === "forumDeclare") {
        await db.ForumModel.findOnly({fid: desTypeId});
      }
      draftObj.desTypeId = desTypeId;
      draftObj.desType = desType;
      draftObj.uid = user.uid;
      draftObj.did = await db.SettingModel.operateSystemID("drafts", 1);
      draft = db.DraftModel(draftObj);
      await draft.save();
    }
    data.draftId = draft.did;
    let surveyDB;
    if(survey) {
      if(survey._id) {
        surveyDB = survey;
        await db.SurveyModel.modifySurvey(survey);
      } else {
        surveyDB = await db.SurveyModel.createSurvey(survey);
      }
      await draft.update({surveyId: surveyDB._id});
    }
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
        await toeditdraft.update({t:body.t,c:body.c,tlm:datestr,abstractCn: body.abstractCn, abstractEn: body.abstractEn, authorInfos:body.authorInfos, keyWordsCn: body.keyWordsCn, keyWordsEn: body.keyWordsEn, originState: body.originState});
        // await db.DraftModel.update({t:body.t},{$set: {c:body.c,toc:datestr}});
        data.status = "success";
        data.did = body.did
    }
    await next()
  });*/
module.exports = draftsRouter;