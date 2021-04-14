const Router = require('koa-router');
const editorRouter = new Router();
editorRouter
  .get('/', async (ctx, next) => {
    const {data, db, query, nkcModules, state} = ctx;
    const {dbFunction} = nkcModules;
    const {user} = data;
    data.ver = query.ver;
    // 判断用户是否已完善账号基本信息（username, avatar）
    await db.UserModel.checkUserBaseInfo(user);
    const {type, id, cat, title, content, toColumn} = query;
    data.toColumn = !!toColumn;
    //发新帖，回复等使用新编辑器
    //重新编辑帖子使用旧版编辑器
    ctx.template = 'interface_editor_test.pug';
    const authLevel = data.user.authLevel;
    data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
	  if(!user.volumeA || authLevel < 1) {
    	ctx.template = 'interface_notice.pug';
    	return await next();
    }
    data.type = type;
    data.id = id;
    data.cat = cat;
    data.title = title;
    data.content = content;
    data.navbar = {};
    data.navbar.highlight = 'editor';
    // type=post:重新编辑回复
    // 如果需要重新编辑html与语言的帖子，就使用新编辑器
    data.forumList = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
    data.panelDatas = await db.ForumModel.getForumsNewTree(data.userRoles, data.userGrade, data.user);
    let contentType = "postToForum";
    if(type === "forum") {
      contentType = "postToForum";
      if(id) {
        const forum = await db.ForumModel.findOne({fid: id});
        if(forum) {
          data.forumType = forum.forumType;
          const childForumCount = await db.ForumModel.countDocuments({parentsId: id});
          if(!childForumCount) data.forum = forum;
          await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
          const breadcrumbForums = await forum.getBreadcrumbForums();
          data.selectedArr = breadcrumbForums.map(forum => forum.fid);
          data.selectedArr.push(forum.fid);
        }
      }
    } else if(type === 'redit') {
      const did = ctx.query.did;
      const singledraft = await db.DraftModel.findOnly({did:did});
      singledraft.originState = singledraft.originState || "";
      singledraft.keyWordsEn = singledraft.keyWordsEn || [];
      singledraft.keyWordsCn = singledraft.keyWordsCn || [];
      singledraft.authorInfos = singledraft.authorInfos || [];
      singledraft.abstractCn = singledraft.abstractCn || "";
      singledraft.abstractEn = singledraft.abstractEn || "";
      if(singledraft.uid !== user.uid) ctx.throw(403, '权限不足');
      data.title = singledraft.t;
      data.content = singledraft.c;
      data.did = singledraft.did;
      data.draftDelType = singledraft.desType; // 草稿来源类型
      data.draftDelTypeId = singledraft.desTypeId; // 草稿来源类型id
      data.targetPost = singledraft.toObject();
      if(data.draftDelType === "thread") {
        contentType = "postToForum";
        const thread = await db.ThreadModel.findOne({tid: data.draftDelTypeId});
        if(thread) {
          data.targetForumsId = thread.mainForumsId;
        }
      } else if(data.draftDelType === "post") {
        const post = await db.PostModel.findOne({pid: data.draftDelTypeId});
        if(post) {
          data.targetForumsId = post.mainForumsId;
          if(post.surveyId) data.targetPost.surveyId = post.surveyId;
        }
        contentType = "postToThread";
      }
      // return await next();
    } else if(type === 'post') {
      const targetPost = await db.PostModel.findOnly({pid: id});  //根据pid查询post表
      if(targetPost.l !== "html"){
        ctx.template = 'interface_editor.pug';
      }
      const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});  //根据tid查询thread表
      if(targetPost.pid === targetThread.oc) {
        contentType = "postToForum";
      } else {
        contentType = "postToThread";
      }
      if(state.userColumn) {
        data.addedToColumn = (await db.ColumnPostModel.countDocuments({columnId: state.userColumn._id, type: "thread", tid: targetThread.tid})) > 0;
      }
      const forums = await targetThread.extendForums(['mainForums']);
      let isModerator = ctx.permission('superModerator');
      if(!isModerator) {
        for(let forum of forums){
          isModerator = await forum.isModerator(user?user.uid: '');
          if(isModerator) break;
        }
      }
      if(targetPost.uid !== user.uid && (!ctx.permission('modifyOtherPosts') || !isModerator)) {
        ctx.throw(403, '权限不足');
      }
      data.targetPost = targetPost;
      data.content = targetPost.c;  //回复内容
      data.title = targetPost.t;  //回复标题
      data.abstract = targetPost.abstract; // 文章摘要
	    data.l = targetPost.l;
      data.targetUser = await targetPost.extendUser();  //回复对象
      data.targetForumsId = data.targetPost.mainForumsId;
      // 附带调查信息
      /*if(data.targetPost.surveyId) {
        const survey = await db.SurveyModel.findOne({_id: data.targetPost.pid});
        if(survey) {

        }
      }*/
      // 在屏蔽日志中查找该帖子是否处于正在退修中
      // 如果是正在退修，取出原因，并显示在编辑器中
      let delPostLog = await db.DelPostLogModel.find({"postId":id,"delType":"toDraft","modifyType":false}).sort({toc:-1})
      if(delPostLog.length > 0){
        data.delReason = delPostLog[0].reason
      }
      // return await next();
    } else if(type === 'forum_declare') {
    	const forum = await db.ForumModel.findOnly({fid: id});
    	data.content = forum.declare;
    } else if(type === 'thread') {
      contentType = "postToThread";
    	const thread = await db.ThreadModel.findOnly({tid: id});
    	data.targetForumsId = thread.mainForumsId;
      if(state.userColumn) {
        data.addedToColumn = (await db.ColumnPostModel.countDocuments({columnId: state.userColumn._id, type: "thread", tid: thread.tid})) > 0;
      }
    	if(thread.closed) ctx.throw(403,'主题已关闭，暂不能发表回复');
    }

    data.allForumList = dbFunction.forumsListSort(data.forumList,data.forumsThreadTypes);

    if(contentType) {
      // 是否有权发表匿名内容
      data.sendAnonymousPost = await db.UserModel.havePermissionToSendAnonymousPost(contentType, data.user.uid);
      // 允许发表匿名内容的专业ID
      const allowedAnonymousForums = await db.ForumModel.find({allowedAnonymousPost: true}, {fid: 1});
      data.allowedAnonymousForumsId = allowedAnonymousForums.map(f => f.fid);
    }


    if(!type || type === "forum" || type === "redit") {
      data.createSurveyPermission = await db.SurveyModel.ensureCreatePermission("postToForum", data.user.uid);
    }

    await next();
  });

module.exports = editorRouter;