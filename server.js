require('./global');

process.on('uncaughtException', function (err) {
  console.log(`uncaughtException:`);
  console.log(err.stack || err.message || err);
});

// 启动测试环境相关工具
if(global.NKC.isDevelopment) {
  require('./timedTask');
  require('./watch.js');
}

require('colors');
const http = require('http'),
  redisClient = require('./settings/redisClient'),
  app = require('./app'),
  elasticSearch = require("./nkcModules/elasticSearch"),
  redLock = require('./nkcModules/redLock'),
  serverConfig = require('./config/server'),
  socket = require('./socket'),
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
    const lock = await redLock.lock(`server:start`, 60000);
    const _startTime = await redisClient.getAsync(startTimeKey);
    if(_startTime < startTime - 10000) {
      console.log(`进程 ${global.NKC.processId} 正在更新缓存...`.green);
      await redisClient.setAsync(startTimeKey, startTime);
      const cacheBaseInfo = require('./redis/cache');
      await dataInit();
      await cacheBaseInfo();
      console.log(`进程 ${global.NKC.processId} 缓存更新完成，正在启动其他进程...`.green);
    }
    await lock.unlock();
    await elasticSearch.init();
    // console.log('ElasticSearch is ready...'.green);

    const port = Number(serverConfig.port);
    const address = serverConfig.address;
    server = http.createServer(app);
    server.keepAliveTimeout = 10 * 1000;
    server.listen(port, address, async () => {
      await socket(server);
      console.log(`NKC进程 ${global.NKC.processId} 启动成功 ${address}:${port}`.green);
    });

    process.on('message', function(msg) {
      if (msg === 'shutdown') {
        server.close();
        console.log(`NKC进程 ${global.NKC.processId} 已停止运行`.green);
        process.exit(0);
      }
    });

  } catch(err) {
    console.error(`error occured when initialize the server.\n${err.stack}`.red);
    process.exit(-1)
  }
};

start();
