module.exports = async (ctx) => {
  ctx.type = 'html';
  ctx.logIt = true;
  ctx.body = ctx.nkcModules.render(ctx.template, ctx.data, ctx.state);
};