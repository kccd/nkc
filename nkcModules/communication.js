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
    const VerifiedUploadModel = require("../dataModels/VerifiedUploadModel");
    const {from, content} = req;
    const {type, data} = content;
    if(type === 'resourceStatus') {
      // 接收到来自 media service 有关附件处理状态的消息
      ResourceModel.updateResourceStatus(data);
    } else if (type === "verifiedUploadState") {
      //接受到来自媒体服务视频认证处理状态信息
      VerifiedUploadModel.updateVerifiedState(data);
    }
  });
}

module.exports = {
  getCommunicationClient
};
