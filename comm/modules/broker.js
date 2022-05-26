const Moleculer = require('moleculer');
const address = require('address');
const commConfig = require('../../config/comm.json');
const path = require('path');
const Broker = new Moleculer.ServiceBroker({
  namespace: commConfig.moleculer.namespace,
  nodeID: `${commConfig.moleculer.nodeID}_${address.ip()}_${process.pid}`,
  transporter: commConfig.moleculer.transporter,
  registry: {
    strategy: commConfig.moleculer.registry.strategy,
    discoverer: commConfig.moleculer.registry.discoverer,
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
