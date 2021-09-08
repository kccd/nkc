const fs = require('fs');
const path = require('path');
const upload = require("../settings/upload");
global.NKC = {};
global.NKC.createFile = (p, data) => {
  console.log(`creating config - ${p}`);
  fs.writeFileSync(p, JSON.stringify(
    data,
    '',
    2
  ));
};


function createServer() {
  const Koa = require('koa');
  const http = require('http');
  const koaBody = require('koa-body');
  const koaStatic = require('koa-static');
  const router = require('./router.js');
  const app = new Koa();
  app.use(koaBody());
  app.use(async (ctx, next) => {
    ctx.body = ctx.request.body;
    try{
      await next();
    } catch(err) {
      console.log(err);
      ctx.status = err.status || 500;
      ctx.body = {
        error: err.message || err
      };
    }

  });
  app.use(async (ctx, next) => {
    const from = ctx.get('FROM');
    if(from !== 'nkcAPI') {
      ctx.type = 'html'
    } else {
      ctx.type = 'json'
    }
    await next();
  });
  app.use(koaStatic(path.resolve('./install/public')));
  app.use(koaStatic(path.resolve('./public')));
  app.use(koaStatic(path.resolve('./pages')));
  app.use(koaStatic(path.resolve('./node_modules')));
  app.use(koaStatic(path.resolve('./statics/site')));
  app.use(router.routes(), router.allowedMethods());
  http.createServer(app.callback()).listen(9000, () => {
    console.log('NKC installer is running at port 9000');
    console.log(`Please open browser and visit localhost:9000\n`);
  });
}



try{
  upload.initFolders();
  createServer();
} catch(err) {
  console.log(err);
}


