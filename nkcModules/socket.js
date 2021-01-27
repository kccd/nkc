const getRoomName = require('../socket/util/getRoomName');
const CommunicationClient = require('../microServices/communication/client');
const communicationConfig = require('../microServices/serviceConfigs/communication');
const PATH = require('path');
const db = require('../dataModels');
const func = {};

const socketClient = new CommunicationClient({
  serviceName: communicationConfig.servicesName.nkc,
  serviceId: global.NKC.processId
});

const socketServiceName = communicationConfig.servicesName.socket;

func.sendConsoleMessage = async (data) => {
  const roomName = getRoomName('console');
  socketClient.sendMessage(socketServiceName, {
    eventName: 'consoleMessage',
    roomName,
    data
  })
  // global.NKC.io.to(roomName).emit('consoleMessage', data);
};

func.sendUserMessage = (channel, messageObject) => {
  return sendMessageToUser(channel, messageObject);
};

func.sendDataMessage = (uid, options) => {
  let {
    event = "dataMessage",
    data = {}
  } = options;
  const roomName = getRoomName('user', uid);
  socketClient.sendMessage(socketServiceName, {
    roomName,
    eventName: event,
    data
  });
  // global.NKC.io.to(roomName).emit(event, data);
}

func.sendForumMessage = async (data) => {
  const render = require('./render');
  const {tid, state, pid} = data;
  let thread = await db.ThreadModel.findOne({tid});
  if(!thread) return;
  const contentType = thread.oc === pid? 'thread': 'post';
  thread = (await db.ThreadModel.extendThreads([thread], {
    htmlToText: true,
    count: 200,
  }))[0];
  const template = PATH.resolve(__dirname, `../pages/publicModules/thread_panel/thread_panel.pug`);
  let usedForumsId = [];
  for(const fid of thread.mainForumsId) {
    const forums = await db.ForumModel.getForumNav(fid);
    for(const forum of forums) {
      if(usedForumsId.includes(forum.fid)) continue;
      const html = render(template, {singleThread: thread}, {...state, threadListStyle: forum.threadListStyle});
      const roomName = getRoomName('forum', forum.fid);
      socketClient.sendMessage(socketServiceName, {
        eventName: 'forumMessage',
        roomName,
        data: {
          html,
          pid,
          tid,
          digest: thread.digest,
          contentType,
        }
      });
      /*global.NKC.io.to(roomName).emit('forumMessage', {
        html,
        pid,
        tid,
        digest: thread.digest,
        contentType,
      });*/
      usedForumsId.push(forum.fid);
    }
  }
};

func.sendPostMessage = async (pid) => {
  const singlePostData = await db.PostModel.getSocketSinglePostData(pid);
  const {
    parentCommentId,
    parentPostId,
    comment,
    html,
    post,
  } = singlePostData;
  const eventName = await db.PostModel.getSocketEventName(pid);
  const thread = await db.ThreadModel.findOnly({tid: post.tid});
  const roomName = getRoomName('post', thread.oc);
  socketClient.sendMessage(socketServiceName, {
    roomName,
    eventName,
    data: {
      postId: post.pid,
      comment,
      parentPostId,
      parentCommentId,
      html
    }
  });
  /*global.NKC.io.to(roomName).emit(eventName, {
    postId: post.pid,
    comment,
    parentPostId,
    parentCommentId,
    html
  });*/
}


// 发送消息到用户
async function sendMessageToUser(channel, message) {
  // let {io} = global.NKC;
  let userRoom = uid => getRoomName("user", uid);
  let userMessage = "message";

  // message.socketId = io.id;
  message.socektId = '';

  try{
    message = JSON.parse(message);
    const _message = await db.MessageModel.extendMessage(undefined, message);
    message._message = _message;


    if(channel === 'withdrawn') {                         // 撤回信息
      const {r, s, _id} = message;
      const sc = {
        eventName: 'withdrawn',
        roomName: [userRoom(r), userRoom(s)],
        data: {
          uid: s,
          messageId: _id
        }
      };
      socketClient.sendMessage(socketServiceName, sc);
      /*io
        .to(userRoom(r))
        .to(userRoom(s))
        .emit(userMessage, {
          uid: s,
          messageId: _id
        });*/
    } else if(channel === 'message') {
      const {ty, s, r} = message;
      if(ty === 'STE') {                                  // 系统通知，通知给所有人
        const sc = {
          eventName: userMessage,
          roomName: null,
          data: {
            message
          }
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .emit(userMessage, {
            message
          });*/
      } else if(ty === 'STU') {                           // 系统提醒，提醒某一个用户
        const sc = {
          eventName: userMessage,
          roomName: userRoom(r),
          data: {
            message
          }
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .to(userRoom(r))
          .emit(userMessage, {
            message
          });*/
      } else if(ty === 'UTU') {                            // 用户间的私信
        const sUser = await db.UserModel.findOne({uid: s});
        const rUser = await db.UserModel.findOne({uid: r});
        if(!sUser || !rUser) return;
        const sc = {
          eventName: userMessage,
          roomName: userRoom(r),
          data: {
            user: sUser,
            targetUser: rUser,
            myUid: r,
            message
          }
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .to(userRoom(r))
          .emit(userMessage, {
            user: sUser,
            targetUser: rUser,
            myUid: r,
            message
          });*/
        message._message.position = 'right';
        const sc_s = {
          eventName: userMessage,
          roomName: userRoom(s),
          data: {
            user: sUser,
            targetUser: rUser,
            myUid: s,
            message
          }
        };
        socketClient.sendMessage(socketServiceName, sc_s);
        /*io
          .to(userRoom(s))
          .emit(userMessage, {
            user: sUser,
            targetUser: rUser,
            myUid: s,
            message
          });*/
      } else if(ty === 'friendsApplication') {           // 好友申请
        const {respondentId, applicantId} = message;
        const respondent = await db.UserModel.findOne({uid: respondentId});
        const applicant = await db.UserModel.findOne({uid: applicantId});
        if(!respondent || !applicant) return;
        const data = {
          message: {
            ty: 'friendsApplication',
            _id: message._id,
            username: applicant.username,
            description: message.description,
            uid: applicant.uid,
            toc: message.toc,
            agree: message.agree
          }
        };
        const sc = {
          eventName: userMessage,
          roomName: userRoom(respondentId),
          data
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .to(userRoom(respondentId))
          .emit(userMessage, data);*/
        if(message.c === 'agree') {
          const sc = {
            eventName: userMessage,
            roomName: userRoom(applicantId),
            data
          };
          socketClient.sendMessage(socketServiceName, sc);
          /*io
            .to(userRoom(applicantId))
            .emit(userMessage, data);*/
        }
      } else if(ty === 'deleteFriend') {         // 删除好友
        const {deleterId, deletedId} = message;
        const sc = {
          eventName: userMessage,
          roomName: [userRoom(deleterId), userRoom(deletedId)],
          data: {message}
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .to(userRoom(deleterId))
          .to(userRoom(deletedId))
          .emit(userMessage, {message});*/
      } else if(ty === 'modifyFriend') {         // 修改好友设置
        const {friend} = message;
        const sc = {
          eventName: userMessage,
          roomName: userRoom(friend.uid),
          data: {message}
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .to(userRoom(friend.uid))
          .emit(userMessage, {message});*/
      } else if(ty === 'removeChat') {           // 删除与好友的聊天
        const {deleterId} = message;
        const sc = {
          eventName: userMessage,
          roomName: userRoom(deleterId),
          data: {message}
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .to(userRoom(deleterId))
          .emit(userMessage, {message});*/
      } else if(ty === 'markAsRead') {           // 多终端同步信息，标记为已读
        const {uid} = message;
        const sc = {
          eventName: userMessage,
          roomName: userRoom(uid),
          data: {message}
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .to(userRoom(uid))
          .emit(userMessage, {message});*/
      } else if(ty === 'editFriendCategory') {   // 编辑好友分组
        const {uid} = message.category;
        const sc = {
          eventName: userMessage,
          roomName: userRoom(uid),
          data: {message}
        };
        socketClient.sendMessage(socketServiceName, sc);
        /*io
          .to(userRoom(uid))
          .emit(userMessage, {message});*/
      }
    }
  } catch(err) {
    console.log(err);
  }
}

module.exports = func;
