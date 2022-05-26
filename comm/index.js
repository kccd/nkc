const {Broker} = require('./modules/broker');
const app = require('./app');
Broker.createService(app);

async function StartBroker() {
  await Broker.start();
  console.log(`Namespace: ${Broker.namespace}`);
  console.log(`NodeID: ${Broker.nodeID}`);
  console.log(`Service: ${app.name} started`);
  console.log(`Version: ${app.version}`);
}

module.exports = {
  StartBroker
};
