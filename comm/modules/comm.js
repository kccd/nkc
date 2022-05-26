const {Broker} = require('./broker');

const ServiceActionNames = {
  v1_websocket_send_room_message: 'v1.websocket.sendRoomMessage'
};

function BrokerCall(serviceActionName, params) {
  return Broker.call(serviceActionName, params);
}

module.exports = {
  ServiceActionNames,
  BrokerCall
};
