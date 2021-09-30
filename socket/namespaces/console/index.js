let io;
require('colors');
const moment = require('moment');
const cookieConfig = require("../../../config/cookie");
const db = require('../../../dataModels');
const Cookies = require('cookies-string-parse');
const util = require('../../util');
const fn = async (i) => {
  io = i;
  io.NKC = {
    socketMessage,
    webMessage
  };
  io.on('error', (err) => {
    console.error(err);
  });
  io.use(async (socket, next) => {
    const {handshake} = socket;
    const cookies = new Cookies(handshake.headers.cookie, {
      keys: [cookieConfig.secret]
    });
    let userInfo = cookies.get('userInfo', {
      signed: true
    });
    let user;
    if(userInfo) {
      try{
        userInfo = Buffer.from(userInfo, "base64").toString();
        userInfo = JSON.parse(userInfo);
        const {uid} = userInfo;
        user = await db.UserModel.findOne({uid});
      } catch(err) {
        console.log(`socket用户信息验证失败`);
      }
    }
    let userRoles = [], userGrade = {}, userOperationsId = [];
    if(!user) {
      const visitorRole = await db.RoleModel.findOnly({_id: 'visitor'});
      userOperationsId = visitorRole.operationsId;
      userRoles = [visitorRole];
    } else {
      if(user.certs.includes('banned')) {
        user.certs = ['banned'];
      } else {
        // 除被封用户以外的所有用户都拥有普通角色的权限
        const defaultRole = await db.RoleModel.findOnly({_id: 'default'});
        userOperationsId = defaultRole.operationsId;
        // 根据用户积分计算用户等级，并且获取该等级下的所有权限
        userGrade = await user.extendGrade();
        if(userGrade) {
          userOperationsId = userOperationsId.concat(userGrade.operationsId);
        }
      }

      // 根据用户的角色获取权限
      await Promise.all(user.certs.map(async cert => {
        const role = await db.RoleModel.findOne({_id: cert});
        if(!role) return;
        userRoles.push(role);
        for(let operationId of role.operationsId) {
          if(!userOperationsId.includes(operationId)) {
            userOperationsId.push(operationId);
          }
        }
      }));
    }

    // 验证权限
    if(!userOperationsId.includes('visitExperimentalConsole')) {
      return next(new Error('权限不足'));
    }

    socket.NKC = {
      userRoles,
      userGrade: userGrade || {},
      userOperationsId,
      uid: user.uid
    };

    // 获取该用户的房间中的全部连接id
    const clients = await util.getRoomClientsId(io, `user/${user.uid}`);
    // 每个用户最大连接数不能超过5
    // 若连接数超过5，则断开之前的连接建立新连接，保证连接数不超过5。
    if(clients.length > 4) {
      let num = clients.length - 4;
      for(let i = 0; i < num; i++) {
        io.connected[clients[i]].disconnect(true);
      }
    }
    await next();
  });
  io.on('connect', (socket) => {
    const {uid} = socket.NKC;
    socket.join(`user/${uid}`, async () => {
      console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' '+global.NKC.processId + ' ').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'/console'.bgBlue} ${'连接成功'.bgGreen}`);
      socketMessage('/console', true, uid);
    });
    socket.on('error', () => {
      disconnect(socket);
    });
    socket.on('disconnect', () => {
      disconnect(socket);
    })
  });
};
module.exports = fn;
function disconnect(socket) {
  const {uid} = socket.NKC;
  console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' '+global.NKC.processId + ' ').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'/console'.bgBlue} ${'断开连接'.bgRed}`);
  socketMessage('/console', false, uid)
}
function socketMessage(url, connect, uid) {
  const data = {
    url,
    uid,
    consoleType: 'socket',
    reqTime: Date.now(),
    processId: global.NKC.processId,
    connect
  };
  io.emit('message', data);
}
function webMessage(data) {
  io.emit('message', data);
}