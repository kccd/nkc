const getRoomName = require('../socket/util/getRoomName');
const communication = require("./communication");
const communicationConfig = require('../config/communication');
const PATH = require('path');
const db = require('../dataModels');
const func = {};

const socketServiceName = communicationConfig.servicesName.socket;

func.sendConsoleMessage = async (data) => {
  const roomName = getRoomName('console');
  const socketClient = await communication.getCommunicationClient();
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
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    roomName,
    eventName: event,
    data
  });
  // global.NKC.io.to(roomName).emit(event, data);
}

func.sendForumMessage = async (data) => {
  const socketClient = communication.getCommunicationClient();
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
  const socketClient = communication.getCommunicationClient();
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
  const socketClient = communication.getCommunicationClient();
  // let {io} = global.NKC;
  //获取用户房间名
  let userRoom = uid => getRoomName("user", uid);
  let userMessage = "message";

  // message.socketId = io.id;
  message.socektId = '';

  try{
    message = JSON.parse(message);
    //判断消息类型
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

/*
* 移除对话
* */
func.sendEventRemoveChat = async (type, uid, tUid) => {
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'removeChat',
    roomName: getRoomName('user', uid),
    data: {
      type,
      uid: tUid
    }
  });
};
/*
* 移除好友
* */
func.sendEventRemoveFriend = async (uid, tUid) => {
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'removeFriend',
    roomName: getRoomName('user', uid),
    data: {
      type: 'UTU',
      uid: tUid
    }
  });
  socketClient.sendMessage(socketServiceName, {
    eventName: 'removeFriend',
    roomName: getRoomName('user', tUid),
    data: {
      type: 'UTU',
      uid: uid
    }
  });
};

/*
* 移除分组
* */
func.sendEventRemoveCategory = async (uid, cid) => {
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'removeCategory',
    roomName: getRoomName('user', uid),
    data: {
      cid
    }
  });
};

/*
* 更新分组列表
* */
func.sendEventUpdateCategoryList = async (uid) => {
  const categoryList = await db.FriendsCategoryModel.getCategories(uid);
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'updateCategoryList',
    roomName: getRoomName('user', uid),
    data: {
      categoryList
    }
  });
};
/*
* 更新用户好友列表
* */
func.sendEventUpdateUserList = async (uid) => {
  const userList = await db.FriendModel.getFriends(uid);
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'updateUserList',
    roomName: getRoomName('user', uid),
    data: {
      userList
    }
  });
};

/*
* 更新用户对话列表
* */
func.sendEventUpdateChatList = async (uid) => {
  const chatList = await db.CreatedChatModel.getCreatedChat(uid);
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'updateChatList',
    roomName: getRoomName('user', uid),
    data: {
      chatList
    }
  });
};

/*
* 撤回消息
* */
func.sendEventWithdrawn = async (uid, tUid, messageId) => {
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'withdrawn',
    roomName: getRoomName('user', uid),
    data: {
      messageId,
      reEdit: true,
    }
  });
  socketClient.sendMessage(socketServiceName, {
    eventName: 'withdrawn',
    roomName: getRoomName('user', tUid),
    data: {
      messageId,
      reEdit: false
    }
  });
};

/*
* 标记为已读
* */
func.sendEventMarkAsRead = async (type, uid, tUid) => {
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'markAsRead',
    roomName: getRoomName('user', uid),
    data: {
      type,
      uid: tUid
    }
  });
};

/*
* 更新单个chat
* @param {String} type UTU/STU/STE/newFriends
* @param {String} uid 当前
* @param {String} tUid 对方
* */
func.sendEventUpdateChat = async (type, uid, tUid) => {
  const chat = await db.CreatedChatModel.getSingleChat(type, uid, tUid);
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'updateChat',
    roomName: getRoomName('user', uid),
    data: {
      chat
    }
  });
};

/*
* 发送普通消息
* */
func.sendMessageToUser = async (messageId, localId) => {
  let message = await db.MessageModel.findOne({_id: messageId});
  if(!message) return;
  const {ty, s, r} = message;
  message = await db.MessageModel.extendMessage(message);
  const socketClient = communication.getCommunicationClient();
  const rChat = await db.CreatedChatModel.getSingleChat(ty, r, s);
  if(ty === 'UTU') {
    const sChat = await db.CreatedChatModel.getSingleChat(ty, s, r);
    socketClient.sendMessage(socketServiceName, {
      eventName: 'receiveMessage',
      roomName: getRoomName('user', s),
      data: {
        localId,
        message,
        chat: sChat
      }
    });
  } else {
    const messageTypes = {
      'STU': 'reminder',
      'STE': 'systemInfo',
      'newFriends': 'newFriends'
    };
    await db.CreatedChatModel.createDefaultChat(messageTypes[ty], r);
  }
  socketClient.sendMessage(socketServiceName, {
    eventName: 'receiveMessage',
    roomName: getRoomName('user', r),
    data: {
      message,
      chat: rChat,
      beep: await db.UserModel.getMessageBeep(r, 'UTU'),
    }
  });
};

/*
* 向在线用户推送系统通知
* */
func.sendSystemInfoToUser = async (messageId) => {
  let message = await db.MessageModel.findOne({_id: messageId});
  if(!message) return;
  message = await db.MessageModel.extendMessage(message);
  // 获取能够接收此消息的用户
  const users = await db.UserModel.find({online: {$ne: ''}}, {uid: 1}).sort({toc: 1});
  const socketClient = communication.getCommunicationClient();
  for(const u of users) {
    const rChat = await db.CreatedChatModel.getSingleChat('STE', u.uid);
    socketClient.sendMessage(socketServiceName, {
      eventName: 'receiveMessage',
      roomName: getRoomName('user', u.uid),
      data: {
        message,
        chat: rChat,
        beep: await db.UserModel.getMessageBeep(u.uid, 'STE'),
      }
    })
  }
};

/*
* 发送新朋友添加请求
* */
func.sendNewFriendApplication = async (applicationId) => {
  const applicationMessage = await db.FriendsApplicationModel.getApplicationMessage(applicationId);
  const message = await db.MessageModel.extendMessage(applicationMessage);
  const chat = await db.CreatedChatModel.getSingleChat('newFriends', applicationMessage.tUid);
  const socketClient = communication.getCommunicationClient();
  socketClient.sendMessage(socketServiceName, {
    eventName: 'receiveMessage',
    roomName: getRoomName('user', applicationMessage.tUid),
    data: {
      localId: applicationId,
      message,
      chat,
      beep: await db.UserModel.getMessageBeep(applicationMessage.tUid, 'newFriends'),
    }
  })
};

module.exports = func;
