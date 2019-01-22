let io;
const db = require('../../../dataModels');
const Cookies = require('cookies-string-parse');
const settings = require('../../../settings');
const util = require('../../util');
const moment = require('moment');
const thread = async (i) => {
  io = i;
  io.NKC = {
    postToThread
  };
  io.use(async (socket, next) => {
    const {handshake} = socket;
    const {tid} = handshake.query;
    const thread = await db.ThreadModel.findOne({tid});
    if(!thread) return next(new Error('thread not found'));
    const cookies = new Cookies(handshake.headers.cookie, {
      keys: [settings.cookie.secret]
    });
    const userInfo = cookies.get('userInfo', {
      signed: true
    });
    let user;
    if(userInfo) {
      try{
        const {username, uid} = JSON.parse(decodeURI(userInfo));
        user = await db.UserModel.findOne({username, uid});
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

    // 验证权限，暂未考虑 分享
    try{
      await thread.extendForum();
      await thread.ensurePermission(userRoles, userGrade, user);
    } catch(err) {
      return next(new Error(err));
    }

    socket.NKC = {
      userRoles,
      userGrade: userGrade || {},
      userOperationsId,
      tid,
      uid: user?user.uid: ''
    };

    // 获取该用户的房间中的全部连接id
    const clients = await util.getRoomClientsId(io, `thread/${user.uid}`);
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
  io.on('connection', (socket) => {
    const {tid, uid} = socket.NKC;
    socket.join(`thread/${tid}`, async () => {
      console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' '+global.NKC.processId + ' ').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${`/thread/${tid}`.bgBlue} ${'连接成功'.bgGreen}`);
      global.NKC.io.of('/console').NKC.socketMessage(`/thread/${tid}`, true, uid);
    });
  });
  io.on('error', (err) => {
    console.log(err);
    disconnect(socket);
  });
  io.on('disconnect', () => {
    disconnect(socket);
  })
};

function disconnect(socket) {
  const {tid, uid} = socket.NKC;
  console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' '+global.NKC.processId + ' ').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${''.grey} ${`/thread/${tid}`.bgBlue} ${'断开连接'.bgRed}`);
  global.NKC.io.of('/console').NKC.socketMessage(`/thread/${tid}`, false, uid);
}

async function postToThread(post) {
  io.to(`thread/${post.tid}`).emit('postToThread', {
    post
  });
}

module.exports = thread;