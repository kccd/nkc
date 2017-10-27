const Router = require('koa-router');
const editorRouter = new Router();

editorRouter
  .get('/', async (ctx, next) => {
    const {target = '', forumID, content} = ctx.query;
    const data = ctx.data;
    ctx.template = 'interface_editor.pug';
    data.replytarget = target;
    data.navbar = {};
    data.navbar.highlight = 'editor';
    if(target.indexOf('post/') === 0) {
      const pid = target.slice(5);
      data.original_post = await ctx.db.PostModel.findOne({pid});
      await next()
    }
    data.original_post = content? decodeURI(content) : '';
    const a = target.split('/')[1];
    await next()
  });

module.exports = editorRouter;