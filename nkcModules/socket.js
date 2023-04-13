const PATH = require('path');
const {
  BrokerCall,
  ServiceActionNames,
  GetSocketServiceRoomName,
} = require('../comm/modules/comm');
const FriendsApplicationModel = require("../dataModels/FriendsApplicationModel");
const MessageModel = require("../dataModels/MessageModel");
const CreatedChatModel = require("../dataModels/CreatedChatModel");
const UserModel = require("../dataModels/UserModel");

function SendMessageToWebsocketServiceRoom(roomName, eventName, data) {
  BrokerCall(ServiceActionNames.v1_websocket_send_message_to_room, {
    room: roomName,
    event: eventName,
    data,
  }).catch((err) => {
    console.log(err.message);
  });
}

// 媒体管理，分组信息
async function sendGroupMessage(uid) {
  return sendDataMessage(uid, {
    event: 'group',
    data: { requestType: 'group' },
  });
}
// 媒体管理，资源信息
async function sendResourcesMessage(uid) {
  return sendDataMessage(uid, {
    event: 'resources',
    data: { requestType: 'resources' },
  });
}

async function sendConsoleMessage(data) {
  const roomName = GetSocketServiceRoomName('console');
  return SendMessageToWebsocketServiceRoom(roomName, 'consoleMessage', data);
}

async function sendUserMessage(channel, messageObject) {
  return sendMessageToUser(channel, messageObject);
}

async function sendDataMessage(uid, options) {
  let { event = 'dataMessage', data = {} } = options;
  const roomName = GetSocketServiceRoomName('user', uid);
  return SendMessageToWebsocketServiceRoom(roomName, event, data);
}

async function sendForumMessage(data) {
  const ThreadModel = require('../dataModels/ThreadModel');
  const ForumModel = require('../dataModels/ForumModel');
  const render = require('./render');
  const { tid, state, pid } = data;
  let thread = await ThreadModel.findOne({ tid });
  if (!thread) {
    return;
  }
  const contentType = thread.oc === pid ? 'thread' : 'post';
  thread = (
    await ThreadModel.extendThreads([thread], {
      htmlToText: true,
      count: 200,
    })
  )[0];
  const template = PATH.resolve(
    __dirname,
    `../pages/publicModules/thread_panel/thread_panel.pug`,
  );
  let usedForumsId = [];
  for (const fid of thread.mainForumsId) {
    const forums = await ForumModel.getForumNav(fid);
    for (const forum of forums) {
      if (usedForumsId.includes(forum.fid)) {
        continue;
      }
      const html = render(
        template,
        { singleThread: thread },
        { ...state, threadListStyle: forum.threadListStyle },
      );
      const roomName = GetSocketServiceRoomName('forum', forum.fid);
      await SendMessageToWebsocketServiceRoom(roomName, 'forumMessage', {
        html,
        pid,
        tid,
        digest: thread.digest,
        contentType,
      });
      usedForumsId.push(forum.fid);
    }
  }
}

// 推送回复给当前文章房间的用户(独立文章)
async function sendCommentMessage(cid) {
  const CommentModel = require('../dataModels/CommentModel');
  // 获取单条评论动态渲染推送的数据
  const singleCommentData = await CommentModel.getSocketSingleCommentData(cid);
  const { comment, html } = singleCommentData;
  const { article } = comment;
  const eventName = await CommentModel.getSocketEventName(cid);
  const rooName = GetSocketServiceRoomName('article', article._id);
  await SendMessageToWebsocketServiceRoom(rooName, eventName, {
    articleId: article._id,
    commentId: comment._id,
    comment,
    html,
  });
}

// 推送回复给当前文章房间的用户(社区文章)
async function sendPostMessage(pid) {
  const PostModel = require('../dataModels/PostModel');
  const ThreadModel = require('../dataModels/ThreadModel');
  // 获取单条post动态渲染推送的数据
  const singlePostData = await PostModel.getSocketSinglePostData(pid);
  const { parentCommentId, parentPostId, comment, html, post } = singlePostData;
  const eventName = await PostModel.getSocketEventName(pid);
  const thread = await ThreadModel.findOnly({ tid: post.tid });
  const roomName = GetSocketServiceRoomName('post', thread.oc);
  await SendMessageToWebsocketServiceRoom(roomName, eventName, {
    postId: post.pid,
    comment,
    parentPostId,
    parentCommentId,
    html,
  });
}

/*
 * 移除对话
 * */
async function sendEventRemoveChat(type, uid, tUid) {
  const roomName = GetSocketServiceRoomName('user', uid);
  await SendMessageToWebsocketServiceRoom(roomName, 'removeChat', {
    type,
    uid: tUid,
  });
}
/*
 * 移除好友
 * */
async function sendEventRemoveFriend(uid, tUid) {
  const roomName = GetSocketServiceRoomName('user', uid);
  const tRoomName = GetSocketServiceRoomName('user', tUid);
  await SendMessageToWebsocketServiceRoom(roomName, 'removeFriend', {
    type: 'UTU',
    uid: tUid,
  });
  await SendMessageToWebsocketServiceRoom(tRoomName, 'removeFriend', {
    type: 'UTU',
    uid: uid,
  });
}

/*
 * 移除分组
 * */
async function sendEventRemoveCategory(uid, cid) {
  const roomName = GetSocketServiceRoomName('user', uid);
  await SendMessageToWebsocketServiceRoom(roomName, 'removeCategory', {
    cid,
  });
}

/*
 * 更新分组列表
 * */
async function sendEventUpdateCategoryList(uid) {
  const FriendsCategoryModel = require('../dataModels/FriendsCategoryModel');
  const categoryList = await FriendsCategoryModel.getCategories(uid);
  const roomName = GetSocketServiceRoomName('user', uid);
  await SendMessageToWebsocketServiceRoom(roomName, 'updateCategoryList', {
    categoryList,
  });
}
/*
 * 更新用户好友列表
 * */
async function sendEventUpdateUserList(uid) {
  const FriendModel = require('../dataModels/FriendModel');
  const userList = await FriendModel.getFriends(uid);
  const roomName = GetSocketServiceRoomName('user', uid);
  await SendMessageToWebsocketServiceRoom(roomName, 'updateUserList', {
    userList,
  });
}

/*
 * 更新用户对话列表
 * */
async function sendEventUpdateChatList(uid) {
  const CreatedChatModel = require('../dataModels/CreatedChatModel');
  const chatList = await CreatedChatModel.getCreatedChat(uid);
  const roomName = GetSocketServiceRoomName('user', uid);
  await SendMessageToWebsocketServiceRoom(roomName, 'updateChatList', {
    chatList,
  });
}

/*
 * 撤回消息
 * */
async function sendEventWithdrawn(uid, tUid, messageId) {
  const roomName = GetSocketServiceRoomName('user', uid);
  const tRoomName = GetSocketServiceRoomName('user', tUid);
  await SendMessageToWebsocketServiceRoom(roomName, 'withdrawn', {
    messageId,
    reEdit: true,
  });
  await SendMessageToWebsocketServiceRoom(tRoomName, 'withdrawn', {
    messageId,
    reEdit: false,
  });
}

/*
 * 标记某个对话所有消息为已读
 * @param type 对话类型
 * @param uid 自己的UID
 * @param tUid 对方的UID
 * */
async function sendEventMarkAsRead(type, uid, tUid) {
  const roomName = GetSocketServiceRoomName('user', uid);
  const UserModel = require('../dataModels/UserModel');
  const user = await UserModel.findOnly({ uid });
  const unread = await user.getUnreadMessageCount();
  await SendMessageToWebsocketServiceRoom(roomName, 'markAsRead', {
    type, // 对话类型
    uid: tUid, // 类型对应的 ID
    unread, // 当前用户未读消息数
  });
}

/*
 * 更新单个chat
 * @param {String} type UTU/STU/STE/newFriends
 * @param {String} uid 当前
 * @param {String} tUid 对方
 * */
async function sendEventUpdateChat(type, uid, tUid) {
  const CreatedChatModel = require('../dataModels/CreatedChatModel');
  const chat = await CreatedChatModel.getSingleChat(type, uid, tUid);
  const roomName = GetSocketServiceRoomName('user', uid);
  await SendMessageToWebsocketServiceRoom(roomName, 'updateChat', {
    chat,
  });
}

/*
 * 发送普通消息
 * */
async function sendMessageToUser(messageId, localId) {
  const MessageModel = require('../dataModels/MessageModel');
  const UserModel = require('../dataModels/UserModel');
  const CreatedChatModel = require('../dataModels/CreatedChatModel');
  let message = await MessageModel.findOne({ _id: messageId });
  if (!message) {
    return;
  }
  const { ty, s, r } = message;
  message = await MessageModel.extendMessage(message);
  const rChat = await CreatedChatModel.getSingleChat(ty, r, s);
  if (ty === 'UTU') {
    const sChat = await CreatedChatModel.getSingleChat(ty, s, r);
    const sRoomName = GetSocketServiceRoomName('user', s);
    await SendMessageToWebsocketServiceRoom(sRoomName, 'receiveMessage', {
      localId,
      message,
      chat: sChat,
    });
  } else {
    const messageTypes = {
      STU: 'reminder',
      STE: 'systemInfo',
      newFriends: 'newFriends',
    };
    await CreatedChatModel.createDefaultChat(messageTypes[ty], r);
  }
  const rRoomName = GetSocketServiceRoomName('user', r);
  await SendMessageToWebsocketServiceRoom(rRoomName, 'receiveMessage', {
    message,
    chat: rChat,
    beep: await UserModel.getMessageBeep(r, 'UTU'),
  });
}

/*
 * 向在线用户推送系统通知
 * */
async function sendSystemInfoToUser(messageId) {
  const MessageModel = require('../dataModels/MessageModel');
  const UserModel = require('../dataModels/UserModel');
  const CreatedChatModel = require('../dataModels/CreatedChatModel');
  let message = await MessageModel.findOne({ _id: messageId });
  if (!message) {
    return;
  }
  message = await MessageModel.extendMessage(message);
  // 获取能够接收此消息的用户
  const users = await UserModel.find({ online: { $ne: '' } }, { uid: 1 }).sort({
    toc: 1,
  });
  for (const u of users) {
    const rChat = await CreatedChatModel.getSingleChat('STE', u.uid);
    const roomName = GetSocketServiceRoomName('user', u.uid);
    await SendMessageToWebsocketServiceRoom(roomName, 'receiveMessage', {
      message,
      chat: rChat,
      beep: await UserModel.getMessageBeep(u.uid, 'STE'),
    });
  }
}

/*
 * 发送新朋友添加请求
 * */
async function sendNewFriendApplication(applicationId) {
  const FriendsApplicationModel = require('../dataModels/FriendsApplicationModel');
  const MessageModel = require('../dataModels/MessageModel');
  const UserModel = require('../dataModels/UserModel');
  const CreatedChatModel = require('../dataModels/CreatedChatModel');
  const applicationMessage =
    await FriendsApplicationModel.getApplicationMessage(applicationId);
  const message = await MessageModel.extendMessage(applicationMessage);
  const chat = await CreatedChatModel.getSingleChat(
    'newFriends',
    applicationMessage.tUid,
  );
  const roomName = GetSocketServiceRoomName('user', applicationMessage.tUid);
  await SendMessageToWebsocketServiceRoom(roomName, 'receiveMessage', {
    localId: applicationId,
    message,
    chat,
    beep: await UserModel.getMessageBeep(applicationMessage.tUid, 'newFriends'),
  });
}
//因为无法区分接收者和发送者所以再写一个函数做区分
async function sendNewFriendApplicationNew(applicationId) {
  const FriendsApplicationModel = require('../dataModels/FriendsApplicationModel');
  const MessageModel = require('../dataModels/MessageModel');
  const UserModel = require('../dataModels/UserModel');
  const CreatedChatModel = require('../dataModels/CreatedChatModel');
  const applicationMessage =
    await FriendsApplicationModel.getApplicationMessage(applicationId);
  const message = await MessageModel.extendMessage(applicationMessage);
  const chat = await CreatedChatModel.getSingleChat(
    'newFriends',
    applicationMessage.tUid,
  );
  const roomName = GetSocketServiceRoomName('user', applicationMessage.tUid);
  await SendMessageToWebsocketServiceRoom(roomName, 'receiveMessage', {
    localId: applicationId,
    message,
    chat,
    beep: await UserModel.getMessageBeep(applicationMessage.tUid, 'newFriends'),
    isUser: true,
  });
}
/*
 * 获取媒体文件处理服务的信息
 * */
async function getMediaServiceInfo() {
  const mediaServerInfo = await BrokerCall(
    ServiceActionNames.v1_media_get_server_info,
    {},
  );
  return {
    host: mediaServerInfo.host,
    port: mediaServerInfo.port,
  };
}

/*
 * 随机获取一个在线的媒体处理服务的链接
 * */
async function getMediaServiceUrl() {
  const mediaServiceInfo = await getMediaServiceInfo();
  return `http://${mediaServiceInfo.host}:${mediaServiceInfo.port}`;
}

/*
 * 调用 render 服务渲染 pug
 * */
async function getPageFromRenderService(templatePath, state, data) {
  return BrokerCall(ServiceActionNames.v1_render_render_pug_file, {
    file: templatePath,
    state,
    data,
  });
}

module.exports = {
  sendGroupMessage,
  sendResourcesMessage,
  sendConsoleMessage,
  sendUserMessage,
  sendDataMessage,
  sendForumMessage,
  sendCommentMessage,
  sendPostMessage,
  sendMessageToUser,
  sendEventRemoveChat,
  sendEventRemoveFriend,
  sendEventRemoveCategory,
  sendEventUpdateCategoryList,
  sendEventUpdateUserList,
  sendEventUpdateChatList,
  sendEventWithdrawn,
  sendEventMarkAsRead,
  sendEventUpdateChat,
  sendSystemInfoToUser,
  sendNewFriendApplication,
  sendNewFriendApplicationNew,
  getMediaServiceInfo,
  getMediaServiceUrl,
  getPageFromRenderService,
};
