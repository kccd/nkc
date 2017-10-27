const path = require('path');
const fs = require('fs');

module.exports = async (ctx, next) => {
  const type = ctx.accepts('json', 'html');
  switch(type) {
    case 'json':
      ctx.type = 'json';
      ctx.body = ctx.data;
      break;
    case 'html':
      ctx.type = 'html';
      ctx.body = ctx.nkcModules.render(ctx.template, ctx.data);
      break;
    default:
      if(ctx.filePath) {
        ctx.body = fs.createReadStream(ctx.filePath);
      } else {
        ctx.throw(406, 'type not accectable')
      }
  }
  await next();
};