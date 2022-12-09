require('./global');

process.on('uncaughtException', function (err) {
  console.log(`uncaughtException:`);
  console.log(err.stack || err.message || err);
});

require('colors');
const http = require('http');
const dbStatus = require('./settings/dbStatus');
const serverConfig = require('./config/server');
let server;

global.NKC.port = Number(serverConfig.port) + global.NKC.processId;
global.NKC.address = serverConfig.address;


const start = async () => {
  try {
    const comm = require('./comm');
    const elasticSearch = require("./nkcModules/elasticSearch");
    await dbStatus.database();
    await comm.StartBroker();
    console.log(`database connected`.green);
    await elasticSearch.init();
    const app = require('./app');
    server = http.createServer(app);
    server.keepAliveTimeout = 10 * 1000;
    server.listen(global.NKC.port, async () => {
      console.log(`nkc service ${global.NKC.processId} is running at ${global.NKC.address}:${global.NKC.port}`.green);
      if(process.connected) process.send('ready');
    });

    // 启动测试环境相关工具
    if(global.NKC.isDevelopment) {
      require('./microServices/store/server');
      require('./timedTask');
    }

    process.on('message', async function(msg) {
      if (msg === 'shutdown') {
        server.close();
        await require('mongoose').disconnect();
        console.log(`nkc service ${global.NKC.processId} stopped`.green);
        process.exit(0);
      }
    });

    process.on('warning', e => console.warn(e.stack));

  } catch(err) {
    console.error(`error occured when initialize the server.\n${err.stack}`.red);
    process.exit(-1)
  }
};

start().catch(console.error);
