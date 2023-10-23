const { processId, isDevelopment } = require('./settings/env');
const logger = require('./nkcModules/logger');
process.on('uncaughtException', function (err) {
  logger.info(`uncaughtException:`);
  logger.info(err.stack || err.message || err);
});

require('colors');
const http = require('http');
const dbStatus = require('./settings/dbStatus');

const { port: NKCPort, host: NKCHost } = require('./nkcModules/config');
const { initEvents } = require('./events');

const start = async () => {
  try {
    const comm = require('./comm');
    const elasticSearch = require('./nkcModules/elasticSearch');
    await dbStatus.database();
    logger.info(`database connected`);
    await comm.StartBroker();
    await elasticSearch.init();
    await initEvents();
    const app = require('./app');
    const server = http.createServer(app);
    server.keepAliveTimeout = 10 * 1000;
    server.listen(NKCPort, async () => {
      logger.info(`nkc service is running at ${NKCHost}:${NKCPort}`);
      if (process.connected) {
        process.send('ready');
      }
    });

    // 启动测试环境相关工具
    if (isDevelopment) {
      require('./microServices/store/server');
      require('./timedTask');
    }

    process.on('message', async function (msg) {
      if (msg === 'shutdown') {
        server.close();
        await require('mongoose').disconnect();
        logger.info(`nkc service ${processId} stopped`);
        process.exit(0);
      }
    });

    process.on('warning', (e) => console.warn(e.stack));
  } catch (err) {
    logger.error(`error occurred when initialize the server.\n${err.stack}`);
    process.exit(-1);
  }
};

start().catch(console.error);
