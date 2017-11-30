const Router = require('koa-router');
const editorRouter = new Router();
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
editorRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {target = '', forumID, content} = ctx.query;
    ctx.template = 'interface_editor.pug';
    data.replytarget = target;
    data.navbar = {};
    data.navbar.highlight = 'editor';
    if(target.indexOf('post/') === 0) {
      const pid = target.slice(5);
      const targetPost = await db.PostModel.findOnly({pid});
      const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
      if(targetPost.uid !== user.uid && !await targetThread.ensurePermissionOfModerators(ctx)) ctx.throw(401, '权限不足');
      data.original_post = targetPost;
      data.targetUser = await targetPost.extendUser();
      return await next();
    }
    data.original_post = content? decodeURI(content) : '';
    const a = target.split('/')[1];
    await next();
  });

module.exports = editorRouter;