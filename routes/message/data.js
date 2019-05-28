const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, query, nkcModules, data} = ctx;
    const {user} = data;
    const {type, firstMessageId, uid} = query;
    if(type === "UTU") {
      const targetUser = await db.UserModel.findOnly({uid});
      const q = {
        $or: [
          {
            r: user.uid,
            s: uid
          },
          {
            r: uid,
            s: user.uid
          }
        ]
      };
      if(firstMessageId) {
        q._id = {$lt: firstMessageId};
      }

      const messages = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
      messages.map(m => {
        if(m.withdrawn) m.c = '';
      });
      data.messages = messages.reverse();
      data.targetUser = targetUser;
      data.targetUserGrade = await targetUser.extendGrade();
      await db.MessageModel.updateMany({ty: 'UTU', r: user.uid, s: uid, vd: false}, {$set: {vd: true}});
      // 判断是否已创建聊天
      await db.CreatedChatModel.createChat(user.uid, uid);
      data.targetUserSendLimit = (await db.UsersGeneralModel.findOnly({uid: targetUser.uid})).messageSettings.limit;
    } else if(type === "STE") {
      const q = {
        ty: 'STE'
      };
      if(firstMessageId) {
        q._id = {
          $lt: firstMessageId
        };
      }
      const messages = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
      data.messages = messages.reverse();
    } else if(type === "STU") {
      const {user} = data;
      const q = {
        ty: 'STU',
        r: user.uid
      };
      if(firstMessageId) {
        q._id = {
          $lt: firstMessageId
        }
      }
      // await db.MessageModel.updateMany({ty: 'STU', r: user.uid, vd: false}, {$set: {vd: true}});
      const remind = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
      const messages = await db.MessageModel.extendSTUMessages(remind);
      data.messages = messages.reverse();
    } else if(type === "newFriends") {
      const q = {
        respondentId: user.uid
      };
      if(firstMessageId) {
        q._id = {
          $lt: firstMessageId
        }
      }
      const friendsApplications = await db.FriendsApplicationModel.find(q).sort({toc: -1}).limit(30);
      const applications = [];
      for(const f of friendsApplications) {
        const targetUser = await db.UserModel.findOne({uid: f.applicantId});
        if(!targetUser) return;
        applications.push({
          _id: f._id,
          username: targetUser.username,
          description: f.description,
          uid: targetUser.uid,
          toc: f.toc,
          agree: f.agree,
          tlm: f.tlm
        });
      }
      data.messages = applications.reverse();
    }
    await next();
  });
module.exports = router;
