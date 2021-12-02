const PATH = require('path');
module.exports = async (ctx) => {
  ctx.type = 'html';
  ctx.logIt = true;
  if(ctx.remoteTemplate) {
    ctx.body = await ctx.nkcModules.socket.getPageFromRenderService(
      ctx.remoteTemplate,
      ctx.remoteState,
      {}
    );
  } else if(ctx.template) {
    const templatePath = PATH.resolve(__dirname, '../../pages', ctx.template);
    if(!await ctx.nkcModules.file.access(templatePath)) {
      ctx.throw(500, `Pug 模板文件不存在 path: ${templatePath}`);
    }
    ctx.body = ctx.nkcModules.render(templatePath, ctx.data, ctx.state, ctx.remoteState);
  } else {
    ctx.throw(500, `未指定 Pug 模板文件`);
  }
};