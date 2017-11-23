const path = require('path');
const fs = require('fs');

module.exports = async (ctx, next) => {
  const {filePath} = ctx;
  if(filePath) {
    ctx.body = fs.createReadStream(ctx.filePath);
  } else {
    const type = ctx.request.accepts('json', 'html');
    switch(type) {
      case 'json':
        ctx.type = 'json';
        ctx.body = ctx.data;
        break;
      case 'html':
        ctx.type = 'html';
        let t = Date.now();
        ctx.body = ctx.nkcModules.render(ctx.template, ctx.data);
        console.log(`=======================渲染页面耗时：${Date.now() - t}ms=======================`);
        break;
      default:
        ctx.throw(406, 'type not accectable')
    }
    await next();
  }
};