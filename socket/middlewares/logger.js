const util = require('../util');
module.exports = async (socket, next) => {
  await util.log.onConnectedSocket(socket);
  await next();
};
