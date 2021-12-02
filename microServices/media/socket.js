const CommunicationClient = require('../../tools/communicationClient');
const communicationConfig = require('../../config/communication');
const {address, port} = global.Media;

const communicationClient = new CommunicationClient({
  serviceName: communicationConfig.servicesName.media,
  serviceId: global.Media.processId,
  servicePort: port,
  serviceAddress: address
});

function getCommunicationClient() {
  return communicationClient;
}
// //通知修改资源文件状态
// function sendResourceStatusToNKC(props) {
//   const {rid, status, error, filesInfo} = props;
//   const communicationClient = getCommunicationClient();
//   communicationClient.sendMessage(communicationConfig.servicesName.nkc, {
//     type: 'resourceStatus',
//     data: {
//       rid,
//       status,
//       error,
//       filesInfo
//     }
//   });
// }
// //通知修改身份认证处理状态
// function sendVerifiedUploadStateToNKC(props) {
//   const {vid, status, error, fileInfo} = props;
//   const communicationClient = getCommunicationClient();
//   communicationClient.sendMessage(communicationConfig.servicesName.nkc, {
//     type: 'verifiedUploadState',
//     data: {
//       vid,
//       status,
//       error,
//       fileInfo
//     }
//   });
// }

//媒体服务通知NKC服务
function sendMessageToNkc(type, props) {
  const communicationClient = getCommunicationClient();
  communicationClient.sendMessage(communicationConfig.servicesName.nkc, {
    type,
    data: props,
  });
}

module.exports = {
  getCommunicationClient,
  // sendResourceStatusToNKC,
  // sendVerifiedUploadStateToNKC,
  sendMessageToNkc
};
