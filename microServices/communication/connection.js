/*
* service to communication
*   socketEventName: message
*   dataFormat: Object
*     @param {String} to 目标服务名
*     @param {Object} content 需要发送的数据
*
* communication to targetService
*   socketEventName: message
*   dataFormat: Object
*     @param {String} from 数据来源服务名
*     @param {Object} content 需接收的数据
*
* emit event callback
* dataFormat: Object
*   @param {Number} status 状态码 200, 500
*   @param {Object} content 返回的数据
*
* 正常时将返回
* {
*   status: 200,
*   content: {自定义数据}
* }
*
* 错误时将返回
* {
*   status: 500,
*   content: {
*     message: "error info"
*   }
* }
* */

const {
  getRoomNameByServiceName,
  getTargetSocketByServiceName,
  getTime,
} = require('./util');
const communicationConfig = require('../../config/communication');
module.exports = async (socketIO) => {
  socketIO.on('connection', async socket => {
    const tag = `communication server ${socket.state.serviceName}:${socket.state.serviceId}`;
    console.log(`${tag} connection`.blue);
    socket.on('error', err => {
      console.log(`${tag} error`.red);
      console.log(err);
    });
    socket.on('disconnect', () => {
      console.log(`${tag} disconnect`.blue);
    });
    socket.on(communicationConfig.messageEventName, async (req, callback) => {
      const {to, content} = req;
      const targetSocket = await getTargetSocketByServiceName(socketIO, to);
      if(!targetSocket) {
        callback({
          status: 500,
          content: {
            message: 'Target service not found'
          }
        });
      } else {
        console.log(`${getTime()} ${tag} >>> ${targetSocket.state.serviceName}:${targetSocket.state.serviceId}`);
        targetSocket.emit(communicationConfig.messageEventName, {
          from: socket.state.serviceName,
          content
        }, callback);
      }
    });
    const {serviceName} = socket.state;
    const roomName = await getRoomNameByServiceName(serviceName);
    socket.join(roomName);
  });
}
