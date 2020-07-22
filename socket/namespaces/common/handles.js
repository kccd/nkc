async function message(data) {
  // this.sendMessage(this.NKC.data.user.uid, "2333333");
  // console.log("收到了消息:", data);
}

async function disconnect(data) {
  // console.log("断开了连接:", data);
}

async function error(info) {
  // console.log("出错了:", info);
}

function makeSend(io) {
  /**
   * 发送消息给用户
   */
  return function send(uid, data) {
    if(typeof uid === "string") {
      io.to(`user/${uid}`).send(data);
      return;
    }
    if(uid.constructor === Array) {
      let oneUid = uid.shift();
      if(!oneUid) return;
      io.to(`user/${oneUid}`).send(data);
      return send(uid, data);
    }
  }
}

module.exports = {
  message,
  disconnect,
  error,
  makeSend
}