const {
  port,
  address,
} = require('../../config/media');

const processId =  Number(process.env.PROCESS_ID) || 0;

global.Media = {
  processId,
  port: Number(port) + processId,
  address
};

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

const body = require('./middlewares/body');
const error = require('./middlewares/error');
const init = require('./middlewares/init');

const app = new koa();

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

server.listen(global.Media.port, () => {
  require('./socket');
  console.log(`media service is running at ${global.Media.port}`.green);
});