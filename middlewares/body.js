const path = require('path');
const fs = require('fs');

module.exports = async (ctx, next) => {
  const {filePath} = ctx;
  if(filePath) {
    ctx.body = fs.createReadStream(ctx.filePath);
  } else {
    const type = ctx.request.accepts('json', 'html', 'image/*');
    switch(type) {
      case 'json':
        ctx.type = 'json';
        ctx.body = ctx.data;
        break;
      case 'html':
        ctx.type = 'html';
        ctx.body = ctx.nkcModules.render(ctx.template, ctx.data);
        break;
      case 'image/*':
        ctx.type = 'image';
        ctx.body = fs.createReadStream(ctx.filePath);
        break;
      default:
        ctx.throw(406, 'type not accectable')
    }
    await next();
  }
};