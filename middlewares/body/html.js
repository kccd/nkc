const PATH = require('path');
module.exports = async (ctx) => {
  ctx.type = 'html';
  ctx.logIt = true;
  if (ctx.remoteTemplate) {
    const pagesPath = PATH.resolve(__dirname, '../../pages');
    const templatePath = PATH.resolve(pagesPath, ctx.remoteTemplate);
    ctx.body = await ctx.nkcModules.socket.getPageFromRenderService(
      templatePath,
      ctx.remoteState,
      ctx.data,
    );
  } else if (ctx.template) {
    const pagesPath = PATH.resolve(__dirname, '../../pages');
    const templatePath = PATH.resolve(pagesPath, ctx.template);
    if (!(await ctx.nkcModules.file.access(templatePath))) {
      ctx.throw(500, `Pug 模板文件不存在 path: ${templatePath}`);
    }
    ctx.body = ctx.nkcModules.render(
      templatePath,
      ctx.data,
      ctx.state,
      ctx.remoteState,
    );
  } else {
    ctx.throw(400, '未在路由中指定页面 Pug 模板');
  }
};
