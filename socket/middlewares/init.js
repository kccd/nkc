const db = require("../../dataModels");
const settings = require("../../settings");
const tools = require("../../tools");
const nkcModules = require("../../nkcModules");

const func = async (socket, next) => {
  socket.NKC = {
    state: {},
    db,
    settings,
    tools,
    nkcModules,
    data: {}
  };
  let address = socket.handshake.headers['x-forwarded-for'];
  if(address !== '') {
    address = address.replace(/::ffff:/ig, '');
    address = address.split(':');
    address = address.length? address[0]:'';
  }
  socket.NKC.address = address;
  await next();
};
module.exports = func;
