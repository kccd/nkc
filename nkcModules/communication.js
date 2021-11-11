const CommunicationClient = require('../tools/communicationClient');
const communicationConfig = require('../config/communication');
const {port, address} = global.NKC;
const communicationClient = new CommunicationClient({
  serviceName: communicationConfig.servicesName.nkc,
  serviceId: global.NKC.processId,
  servicePort: port,
  serviceAddress: address
});
function getCommunicationClient() {
  return communicationClient;
}

module.exports = {
  getCommunicationClient
};
