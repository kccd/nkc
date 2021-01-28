const CommunicationClient = require('../microServices/communication/client');
const communicationConfig = require('../microServices/serviceConfigs/communication');
let communicationClient;
const func = {};
func.getCommunicationClient = () => {
  if(communicationClient) return communicationClient;
  communicationClient = new CommunicationClient({
    serviceName: communicationConfig.servicesName.nkc,
    serviceId: global.NKC.processId
  });
  return communicationClient;
};

module.exports = func;
