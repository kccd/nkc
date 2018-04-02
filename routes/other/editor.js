const Router = require('koa-router');
const editorRouter = new Router();
const nkcModules = require('../../nkcModules');
editorRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const {type, id, cat, title, content} = query;
    ctx.template = 'interface_editor.pug';
    data.type = type;
    data.id = id;
    data.cat = cat;
    data.title = title;
    data.content = content;
    data.navbar = {};
    data.navbar.highlight = 'editor';
    if(type === 'post') {
      const targetPost = await db.PostModel.findOnly({pid: id});
      const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
      if(targetPost.uid !== user.uid && !await targetThread.ensurePermissionOfModerators(ctx)) ctx.throw(403, '权限不足');
      data.content = targetPost.c;
      data.title = targetPost.t;
      data.targetUser = await targetPost.extendUser();
      return await next();
    } else if(type === 'application') {
    	const applicationForm = await db.FundApplicationFormModel.findOnly({_id: id});
    	if(cat === 'p') {
    		const project = await applicationForm.extendProject();
    		data.title = project.t;
    		data.content = project.c;
	    } else if(cat === 'c') {
				if(!user) ctx.throw(401, '您还没有登陆，请先登陆。');
				if(!user.certs.includes('mobile')) ctx.throw(401, '请先绑定手机号完成实名认证。');
	    } else if(cat === 'r') {

	    }
	    return await next();
    }
    await next();
  });

module.exports = editorRouter;