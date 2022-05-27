const {Broker} = require('./broker');

const ServiceActionNames = {
  v1_websocket_send_message_to_rooms: 'v1.websocket.sendMessageToRooms',
  v1_websocket_send_message_to_room: 'v1.websocket.sendMessageToRoom',
  v1_media_get_server_info: 'v1.media.getServerInfo'
};

function BrokerCall(serviceActionName, params) {
  return Broker.call(serviceActionName, params);
}

module.exports = {
  ServiceActionNames,
  BrokerCall
};
