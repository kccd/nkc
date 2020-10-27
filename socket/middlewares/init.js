const db = require("../../dataModels");
const settings = require("../../settings");
const tools = require("../../tools");
const nkcModules = require("../../nkcModules");
const util = require('../util');
const func = async (socket, next) => {
  socket.NKC = {
    db,
    settings,
    tools,
    nkcModules,
    util,
    data: {},
    query: {},
  };
  let address = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  if(address !== '') {
    address = address.replace(/::ffff:/ig, '');
    address = address.split(':');
    address = address.length? address[0]:'';
  }
  socket.NKC.address = address;
  socket.NKC.query = socket.handshake.query;
  await next();
};
module.exports = func;
