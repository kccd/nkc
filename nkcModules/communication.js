const CommunicationClient = require('../tools/communicationClient');
const communicationConfig = require('../config/communication');
const {port, address} = global.NKC;
let communicationClient;


function getCommunicationClient() {
  if(communicationClient) return communicationClient;
  communicationClient = new CommunicationClient({
    serviceName: communicationConfig.servicesName.nkc,
    serviceId: global.NKC.processId,
    servicePort: port,
    serviceAddress: address
  });

  communicationClient.onMessage((req) => {
    const ResourceModel = require('../dataModels/ResourceModel');
    const {from, content} = req;
    const {type, data} = content;
    if(type === 'resourceStatus') {
      // 接收到来自 media service 有关附件处理状态的消息
      ResourceModel.updateResourceStatus(data);
    }
  });
}

module.exports = {
  getCommunicationClient
};
