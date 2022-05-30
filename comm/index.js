const {Broker} = require('./modules/broker');
const {GetWebConfigs} = require('./modules/configs');
const app = require('./app');
Broker.createService(app);

async function StartBroker() {
  await Broker.start();
  console.log(`Namespace: ${Broker.namespace}`);
  console.log(`NodeID: ${Broker.nodeID}`);
  console.log(`Service: ${app.name} started`);
  console.log(`Version: ${app.version}`);
  ConsoleApiServiceInfo();
}

function ConsoleApiServiceInfo() {
  const webConfigs = GetWebConfigs();
  if (webConfigs.enabled) {
    console.log(
      `ApiService is running at ${webConfigs.host}:${webConfigs.port}`,
    );
  }
}

module.exports = {
  StartBroker
};
