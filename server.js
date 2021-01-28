require('./global');

process.on('uncaughtException', function (err) {
  console.log(`uncaughtException:`);
  console.log(err.stack || err.message || err);
});

require('colors');
const http = require('http'),
  redisClient = require('./settings/redisClient'),
  app = require('./app'),
  elasticSearch = require("./nkcModules/elasticSearch"),
  redLock = require('./nkcModules/redLock'),
  serverConfig = require('./config/server'),
  communication = require('./nkcModules/communication'),
  {
    RoleModel,
    ForumModel,
  } = require('./dataModels'),
  permission = require('./nkcModules/permission');
let server;

const dataInit = async () => {
  const defaultData = require('./defaultData');
  await defaultData.init();
  // 运维包含所有的操作权限
  const operationsId = permission.getOperationsId();
  await RoleModel.updateOne({_id: 'dev'}, {$set: {operationsId: operationsId}});
  await ForumModel.updateMany({}, {$addToSet: {rolesId: 'dev'}});
};


const start = async () => {
  try {
    const startTime = global.NKC.startTime;
    const startTimeKey = `server:start:time`;
    process.send('ready');
    const lock = await redLock.lock(`server:start`, 30 * 1000);
    const _startTime = await redisClient.getAsync(startTimeKey);
    if(!_startTime || _startTime < startTime - 60000) {
      console.log(`updating cache...`.green);
      await redisClient.setAsync(startTimeKey, startTime);
      const cacheBaseInfo = require('./redis/cache');
      await dataInit();
      await cacheBaseInfo();
      console.log(`starting service...`.green);
    }
    await lock.unlock();
    await elasticSearch.init();
    // console.log('ElasticSearch is ready...'.green);

    communication.getCommunicationClient();

    const port = Number(serverConfig.port);
    const address = serverConfig.address;
    server = http.createServer(app);
    server.keepAliveTimeout = 10 * 1000;
    server.listen(port, address, async () => {
      console.log(`nkc service ${global.NKC.processId} is running at ${address}:${port}`.green);
    });

    // 启动测试环境相关工具
    if(global.NKC.isDevelopment) {
      require('./microServices/communication/server');
      const socket = require('./socket/index');
      await socket(server)
      require('./timedTask');
      require('./watch.js');
    }

    process.on('message', function(msg) {
      if (msg === 'shutdown') {
        server.close();
        console.log(`nkc service ${global.NKC.processId} has stopped`.green);
        process.exit(0);
      }
    });

  } catch(err) {
    console.error(`error occured when initialize the server.\n${err.stack}`.red);
    process.exit(-1)
  }
};

start();
