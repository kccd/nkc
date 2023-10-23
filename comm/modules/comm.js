const { Broker } = require('./broker');

const ServiceActionNames = {
  v1_websocket_send_message_to_rooms: 'v1.websocket.sendMessageToRooms',
  v1_websocket_send_message_to_room: 'v1.websocket.sendMessageToRoom',
  v1_media_get_server_info: 'v1.media.getServerInfo',
  v1_render_render_pug_file: 'v1.render.renderPugFile',
};

function BrokerCall(serviceActionName, params) {
  return Broker.call(serviceActionName, params);
}

const SocketServiceRoomMap = {
  console: 'CONSOLE',
  user: (uid) => `USER:${uid}`,
  forum: (fid) => `FORUM:${fid}`,
  thread: (tid) => `THREAD:${tid}`,
  post: (pid) => `POST:${pid}`,
  comment: (cid) => `COMMENT:${cid}`,
  article: (aid) => `ARTICLE:${aid}`,
  zoneHome: () => `ZONEHOME`,
};

function GetSocketServiceRoomName(type, ...params) {
  let value = SocketServiceRoomMap[type];
  let valueType = typeof value;
  if (valueType === 'function') {
    return value.apply(null, params);
  } else {
    return value;
  }
}

module.exports = {
  ServiceActionNames,
  GetSocketServiceRoomName,
  BrokerCall,
};
