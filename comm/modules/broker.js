const Moleculer = require('moleculer');
const address = require('address');
const path = require('path');
const {GetMoleculerConfigs} = require('./configs');
const moleculerConfigs = GetMoleculerConfigs();
const Broker = new Moleculer.ServiceBroker({
  namespace: moleculerConfigs.namespace,
  nodeID: `${moleculerConfigs.nodeID}_${address.ip()}_${process.pid}`,
  transporter: moleculerConfigs.transporter,
  registry: {
    strategy: moleculerConfigs.registry.strategy,
    discoverer: moleculerConfigs.registry.discoverer,
  },
  logger: {
    type: 'File',
    options: {
      folder: path.resolve(__dirname, '../../logs'),
      filename: 'moleculer-{date}.log',
      formatter: 'json',
      eol: '\n',
      interval: 5 * 1000,
    }
  }
});

module.exports = {
  Broker
};
