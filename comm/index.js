const { Broker } = require('./modules/broker');
const { GetWebConfigs } = require('./modules/configs');
const logger = require('../nkcModules/logger');
const app = require('./app');
Broker.createService(app);

async function StartBroker() {
  await Broker.start();
  logger.info(`Namespace: ${Broker.namespace}`);
  logger.info(`NodeID: ${Broker.nodeID}`);
  logger.info(`Service: ${app.name}`);
  logger.info(`Version: ${app.version}`);
  ConsoleApiServiceInfo();
}

function ConsoleApiServiceInfo() {
  const webConfigs = GetWebConfigs();
  if (webConfigs.enabled) {
    logger.info(
      `ApiService is running at ${webConfigs.host}:${webConfigs.port}`,
    );
  }
}

module.exports = {
  StartBroker,
};
