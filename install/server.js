const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
global.NKC = {};
global.NKC.createFile = (p, data) => {
  console.log(`creating config - ${p}`);
  fs.writeFileSync(p, JSON.stringify(
    data,
    '',
    2
  ));
};

function installModules() {
  console.log(`Installing dependencies...`);
  const command = 'npm install';
  try {
    execSync(command, {
      cwd: path.join(__dirname, '../'),
      stdio: [0, 1, 2],
    });
  } catch (e) {
    console.log('Error installing dependencies!');
    console.log('message: ' + e.message);
    console.log('stdout: ' + e.stdout);
    console.log('stderr: ' + e.stderr);
    throw e;
  }
}


function createServer() {
  console.log(`Creating installer server...`);
  const open = require('open');
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
      console.log(err.message || err);
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
  app.use(koaStatic(path.resolve('./pages')));
  app.use(koaStatic(path.resolve('./node_modules')));
  app.use(koaStatic(path.resolve('./statics/site')));
  app.use(router.routes(), router.allowedMethods());
  http.createServer(app.callback()).listen(9000, () => {
    console.log('server is running http://127.0.0.1:9000');
    open('http://127.0.0.1:9000');
  });
}



try{
  installModules();
  upload.initFolders();
  createServer();
} catch(err) {
  console.log(err);
}


