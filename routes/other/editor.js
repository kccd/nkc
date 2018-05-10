const Router = require('koa-router');
const editorRouter = new Router();
const nkcModules = require('../../nkcModules');
editorRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const {type, id, cat, title, content} = query;
    //发新帖，回复等使用新编辑器
    //重新编辑帖子使用旧版编辑器
    ctx.template = 'interface_editor_test.pug';
	  if((!user.volumeA || !user.certs.includes('mobile')) && type !== 'application') {
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

    if(type !== 'application') {
	    data.forumList = await db.ForumModel.getAccessibleForums(ctx);
	    data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
	    if(type === 'forum' && id) {
	    	const forum = await db.ForumModel.findOnly({fid: id});
	    	await forum.ensurePermission(ctx);
	    	const breadcrumbForums = await forum.getBreadcrumbForums(ctx);
	    	data.selectedArr = breadcrumbForums.map(forum => forum.fid);
	    	data.selectedArr.push(forum.fid);
	    }
    }

	  //type=post:重新编辑回复
    //如果需要重新编辑html与语言的帖子，就使用新编辑器
    if(type === 'redit') {
      ctx.template = 'interface_editor_test.pug';
      const did = ctx.query.did;
      const singledraft = await db.DraftModel.findOnly({did:did});
      if(singledraft.uid !== user.uid) ctx.throw(403, '权限不足');
      data.title = singledraft.t;
      data.content = singledraft.c;
      data.did = singledraft.did;
      return await next();
    }
    if(type === 'post') {
      ctx.template = 'interface_editor.pug';
      const targetPost = await db.PostModel.findOnly({pid: id});  //根据pid查询post表
      if(targetPost.l === "html"){
        ctx.template = 'interface_editor_test.pug';
      }
      const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});  //根据tid查询thread表
      if(targetPost.uid !== user.uid && !await targetThread.ensurePermissionOfModerators(ctx)) ctx.throw(403, '权限不足');
      data.content = targetPost.c;  //回复内容
      data.title = targetPost.t;  //回复标题
	    data.l = targetPost.l;
      data.targetUser = await targetPost.extendUser();  //回复对象
      return await next();
    } else if(type === 'application') {
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
				if(!user.certs.includes('mobile')) ctx.throw(403,'请先绑定手机号完成实名认证。');
	    } else if(cat === 'r') {

	    }
	    return await next();
    }
    await next();
  });

module.exports = editorRouter;