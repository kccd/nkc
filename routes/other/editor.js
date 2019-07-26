const Router = require('koa-router');
const editorRouter = new Router();
editorRouter
  .get('/', async (ctx, next) => {
    const {data, db, query, nkcModules, state} = ctx;
    const {dbFunction} = nkcModules;
    const {user} = data;
    data.ver = query.ver;
    // 判断用户是否已完善账号基本信息（username, avatar, banner）
    if(!await db.UserModel.checkUserBaseInfo(user)) {
      nkcModules.throwError(403, "未完善账号基本信息", "userBaseInfo");
    }
    const {type, id, cat, title, content, toColumn} = query;
    data.toColumn = !!toColumn;
    //发新帖，回复等使用新编辑器
    //重新编辑帖子使用旧版编辑器
    ctx.template = 'interface_editor_test.pug';
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    const userSubscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
    let existsFid = "";
    if(type && type === "forum"){
      existsFid = id;
    }
    data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
    const authLevel = await userPersonal.getAuthLevel();
	  if((!user.volumeA || authLevel < 1) && type !== 'application') {
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
    if(type !== 'application') {
	    data.forumList = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
      data.panelDatas = await db.ForumModel.getForumsNewTree(data.userRoles, data.userGrade, data.user);
	    if(type === 'forum' && id) {
        const forum = await db.ForumModel.findOnly({fid: id});
        data.forum = forum;
        data.forumType = forum.forumType;
	    	await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
	    	const breadcrumbForums = await forum.getBreadcrumbForums();
	    	data.selectedArr = breadcrumbForums.map(forum => forum.fid);
        data.selectedArr.push(forum.fid);
	    }
    }

    if(type === 'redit') {
      ctx.template = 'interface_editor_test.pug';
      const did = ctx.query.did;
      const singledraft = await db.DraftModel.findOnly({did:did});
      if(singledraft.uid !== user.uid) ctx.throw(403, '权限不足');
      data.title = singledraft.t;
      data.content = singledraft.c;
      data.did = singledraft.did;
      data.draftDelType = singledraft.desType; // 草稿来源类型
      data.draftDelTypeId = singledraft.desTypeId; // 草稿来源类型id
      data.targetPost = singledraft;
      return await next();
    }
    if(type === 'post') {
      ctx.template = 'interface_editor.pug';
      const targetPost = await db.PostModel.findOnly({pid: id});  //根据pid查询post表
      if(targetPost.l === "html"){
        ctx.template = 'interface_editor_test.pug';
      }
      const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});  //根据tid查询thread表
      if(data.user) {
        if(state.userColumn) {
          data.addedToColumn = (await db.ColumnPostModel.count({columnId: state.userColumn._id, type: "thread", tid: targetThread.tid})) > 0;
        }
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
      // if(targetPost.uid !== user.uid && !await targetThread.ensurePermissionOfModerators(ctx)) ctx.throw(403, '权限不足');
      data.targetPost = targetPost;
      data.content = targetPost.c;  //回复内容
      data.title = targetPost.t;  //回复标题
      data.abstract = targetPost.abstract; // 文章摘要
	    data.l = targetPost.l;
      data.targetUser = await targetPost.extendUser();  //回复对象
      // 在屏蔽日志中查找该帖子是否处于正在退修中
      // 如果是正在退修，取出原因，并显示在编辑器中
      let delPostLog = await db.DelPostLogModel.find({"postId":id,"delType":"toDraft","modifyType":false}).sort({toc:-1})
      if(delPostLog.length > 0){
        data.delReason = delPostLog[0].reason
      }
      return await next();
    } else if(type === 'application') {
      ctx.throw(403, "编辑器暂不支持编辑科创基金的内容");
      ctx.template = 'interface_editor_test.pug';
    	const applicationForm = await db.FundApplicationFormModel.findOnly({_id: id});
    	if(cat === 'p') {
    		const project = await applicationForm.extendProject();
    		if(project.l !== 'html') {
			    ctx.template = 'interface_editor.pug';
		    }
    		data.title = project.t;
    		data.content = project.c;
	    } else if(cat === 'c') {
				if(!user) ctx.throw(403,'您还没有登录，请先登录。');
				if(authLevel < 1) ctx.throw(403,'请先绑定手机号完成实名认证。');
	    } else if(cat === 'r') {

	    }
	    return await next();
    } else if(type === 'forum_declare') {
    	const forum = await db.ForumModel.findOnly({fid: id});
    	data.content = forum.declare;
    }

    if(type === 'thread') {
    	const thread = await db.ThreadModel.findOnly({tid: id});
      if(data.user) {
        if(state.userColumn) {
          data.addedToColumn = (await db.ColumnPostModel.count({columnId: state.userColumn._id, type: "thread", tid: thread.tid})) > 0;
        }
      }
    	if(thread.closed) ctx.throw(403,'主题已关闭，暂不能发表回复');
    }
    
    const allForumList = dbFunction.forumsListSort(data.forumList,data.forumsThreadTypes);
    data.allForumList = allForumList;

    await next();
  });

module.exports = editorRouter;