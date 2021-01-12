const getRoomName = require('../socket/util/getRoomName');
const PATH = require('path');
const db = require('../dataModels');
const func = {};

func.sendConsoleMessage = (data) => {
  const roomName = getRoomName('console');
  global.NKC.io.to(roomName).emit('consoleMessage', data);
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
  global.NKC.io.to(roomName).emit(event, data);
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
      global.NKC.io.to(roomName).emit('forumMessage', {
        html,
        pid,
        tid,
        digest: thread.digest,
        contentType,
      });
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
  global.NKC.io.to(roomName).emit(eventName, {
    postId: post.pid,
    comment,
    parentPostId,
    parentCommentId,
    html
  });
}


// 发送消息到用户
async function sendMessageToUser(channel, message) {
  let {io} = global.NKC;
  let userRoom = uid => getRoomName("user", uid);
  let userMessage = "message";

  message.socketId = io.id;

  try{
    message = JSON.parse(message);
    const _message = await db.MessageModel.extendMessage(undefined, message);
    message._message = _message;
    if(channel === 'withdrawn') {                         // 撤回信息
      const {r, s, _id} = message;
      io
        .to(userRoom(r))
        .to(userRoom(s))
        .emit(userMessage, {
          uid: s,
          messageId: _id
        });
    } else if(channel === 'message') {
      const {ty, s, r} = message;
      if(ty === 'STE') {                                  // 系统通知，通知给所有人
        io
          .emit(userMessage, {
            message
          });
      } else if(ty === 'STU') {                           // 系统提醒，提醒某一个用户
        io
          .to(userRoom(r))
          .emit(userMessage, {
            message
          });
      } else if(ty === 'UTU') {                            // 用户间的私信
        const sUser = await db.UserModel.findOne({uid: s});
        const rUser = await db.UserModel.findOne({uid: r});
        if(!sUser || !rUser) return;
        io
          .to(userRoom(r))
          .emit(userMessage, {
            user: sUser,
            targetUser: rUser,
            myUid: r,
            message
          });
        message._message.position = 'right';
        io
          .to(userRoom(s))
          .emit(userMessage, {
            user: sUser,
            targetUser: rUser,
            myUid: s,
            message
          });
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
        io
          .to(userRoom(respondentId))
          .emit(userMessage, data);
        if(message.c === 'agree') {
          io
            .to(userRoom(applicantId))
            .emit(userMessage, data);
        }
      } else if(ty === 'deleteFriend') {         // 删除好友
        const {deleterId, deletedId} = message;
        io
          .to(userRoom(deleterId))
          .to(userRoom(deletedId))
          .emit(userMessage, {message});
      } else if(ty === 'modifyFriend') {         // 修改好友设置
        const {friend} = message;
        io
          .to(userRoom(friend.uid))
          .emit(userMessage, {message});
      } else if(ty === 'removeChat') {           // 删除与好友的聊天
        const {deleterId} = message;
        io
          .to(userRoom(deleterId))
          .emit(userMessage, {message});
      } else if(ty === 'markAsRead') {           // 多终端同步信息，标记为已读
        const {uid} = message;
        io
          .to(userRoom(uid))
          .emit(userMessage, {message});
      } else if(ty === 'editFriendCategory') {   // 编辑好友分组
        const {uid} = message.category;
        io
          .to(userRoom(uid))
          .emit(userMessage, {message});
      }
    }
  } catch(err) {
    console.log(err);
  }
}

module.exports = func;
