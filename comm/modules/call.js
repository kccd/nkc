const {Broker} = require('./broker');

const ServiceActionNames = {};

function BrokerCall(serviceActionName, params) {
  return Broker.call(serviceActionName, params);
}

module.exports = {
  ServiceActionNames,
  BrokerCall
};
