const db = require("../../dataModels");
const settings = require("../../settings");
const tools = require("../../tools");
const nkcModules = require("../../nkcModules");

const func = async (socket, next) => {
  socket.NKC = {
    db,
    settings,
    tools,
    nkcModules,
    data: {},
    state: {}
  };
  await next();
};
module.exports = func;