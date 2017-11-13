const path = require('path');
const fs = require('fs');

module.exports = async (ctx, next) => {
  // if(ctx.filePath) {
  //   console.log(ctx.type);
  //   ctx.type = 'image/jpg';
  //   console.log(ctx.response.type);
  //   console.log(ctx.type);
  //   console.log(JSON.stringify(ctx.is('image')));
  //   ctx.body = fs.createReadStream(ctx.filePath);
  //   await next();
  // } else {
  console.log(ctx.request.get('Accept'));
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
        ctx.throw(406, 'type not accectable')
    }
    await next();
  // }
};