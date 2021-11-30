require('colors');
const http = require('http')
const koa = require('koa');
const koaBody = require('koa-body');
const router = require('./routes');
const fs = require('fs');
const path =  require('path');
const tempPath = path.resolve(__dirname, `./temp`);

try{
  fs.accessSync(tempPath)
} catch(err) {
  fs.mkdirSync(tempPath);
}

const {
  port,
  attachment
} = require('../../config/store');

const body = require('./middlewares/body');
const error = require('./middlewares/error');
const init = require('./middlewares/init');

if(!attachment || attachment.length === 0) throw new Error(`未指定文件目录`);

const app = new koa();

app.on('error', err => {
  // console.log(`koa error:`, err);
});

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFields: 20,
    maxFileSize: 1024 * 1024 * 1024 * 1024 * 1024,
    uploadDir: tempPath,
    hash: 'md5',
    keepExtensions: true
  }
}));
app.use(error);
app.use(init);
app.use(router.routes());
app.use(body);

const server = http.createServer(app.callback());

server.listen(port, () => {
  console.log(`store service is running at ${port}`.green);
});