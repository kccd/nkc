const CommunicationClient = require('../tools/communicationClient');
const communicationConfig = require('../config/communication');
const {getUserInfo} = require('./cookie');
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

  communicationClient.onMessage(async (req) => {
    const ResourceModel = require('../dataModels/ResourceModel');
    const VerifiedUploadModel = require("../dataModels/VerifiedUploadModel");
    const UserModel = require('../dataModels/UserModel');
    const MessageModel = require('../dataModels/MessageModel');
    const PostModel = require('../dataModels/PostModel');
    const ThreadModel = require('../dataModels/ThreadModel');
    const ForumModel = require('../dataModels/ForumModel');
    const {from, content} = req;
    const {type, data} = content;
    if(type === 'resourceStatus') {
      // 接收到来自 media service 有关附件处理状态的消息
      ResourceModel.updateResourceStatus(data);
    } else if (type === "verifiedUploadState") {
      //接受到来自媒体服务视频认证处理状态信息
      VerifiedUploadModel.updateVerifiedState(data);
    } else if(type === 'messageServiceGetAuthInfo') {
      // 判断 cookie 是否有效
      // 如果 cookie 有效则更新用户在线信息（平台和状态）
      // 根据权限 ID 判断用户是否有权
      // 获取用户好友 ID 和已创建对话用户 ID
      const {
        os,
        cookie,
        operationId
      } = data;

      const userInfo = getUserInfo(cookie);
      if(!userInfo) return null;
      const user = await UserModel.findOnly({uid: userInfo.uid});
      const operationsId = await user.getUserOperationsId();
      if(!operationsId.includes(operationId)) return null;
      const onlineStatus = await user.setOnlineStatus(os);
      const {
        newSystemInfoCount,
        newApplicationsCount,
        newReminderCount,
        newUsersMessagesCount
      } = await user.getNewMessagesCount();
      const newMessageCount = newSystemInfoCount + newApplicationsCount + newReminderCount + newUsersMessagesCount;
      const friendsUid = await MessageModel.getUsersFriendsUid(user.uid);
      return {
        uid: user.uid,
        onlineStatus,
        friendsUid,
        newMessageCount
      }
    } else if(type === 'messageServiceSetUserOnlineStatus') {
      const {uid, online} = data;
      const user = await UserModel.findOnly({uid});
      const onlineStatus = await user.setOnlineStatus(online);
      return {
        onlineStatus
      }
    } else if(type === 'messageServiceGetUsersFriendsUid') {
      const {uid} = data;
      const friendsUid = await MessageModel.getUsersFriendsUid(uid);
      return {
        friendsUid
      }
    } else if(type === 'messageServiceCheckPostPermission') {
      const {uid, pid} = data;
      const result = {
        hasPermission: false
      };
      const post = await PostModel.findOne({pid});
      if(!post) return result;
      const thread = await ThreadModel.findOne({tid: post.tid});
      if(!thread) return result;
      const user = await UserModel.findOnly({uid});
      const userGrade = await user.extendGrade();
      const userRoles = await user.extendRoles();
      try{
        await thread.ensurePermission(userRoles, userGrade, user);
        result.hasPermission = true;
      } catch(err) {}
      return result;
    } else if(type === 'messageServiceCheckForumPermission') {
      const {uid, fid} = data;
      const forumsId = await ForumModel.getReadableForumsIdByUid(uid);
      const hasPermission = forumsId.includes(fid);
      return {
        hasPermission
      }
    }
  });
  return communicationClient;
}

module.exports = {
  getCommunicationClient
};
