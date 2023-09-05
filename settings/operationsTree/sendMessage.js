const { Operations } = require('../operations.js');
module.exports = {
  changeMobile: {
    POST: Operations.sendChangeMobileMessage,
  },
  bindMobile: {
    POST: Operations.sendBindMobileMessage,
  },
  register: {
    POST: Operations.sendRegisterMessage,
  },
  getback: {
    POST: Operations.sendGetBackPasswordMessage,
  },
  login: {
    POST: Operations.sendLoginMessage,
  },
  withdraw: {
    POST: Operations.sendWithdrawMessage,
  },
  destroy: {
    POST: Operations.sendDestroyMessage,
  },
  unbindMobile: {
    POST: Operations.sendUnbindMobileMessage,
  },
  common: {
    POST: Operations.sendPhoneMessage,
  },
};
