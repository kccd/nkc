const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, data, body, nkcModules} = ctx;
    const {type, disabled, reason} = body;
    const {column} = data;
    let obj = {};
    let messageType;
    if(disabled && !reason) ctx.throw(400, "屏蔽理由不能为空");
    if(type === "column") {
      messageType = "disabledColumn";
      if(column.disabled && disabled) ctx.throw(400, "专栏已被屏蔽，请刷新");
      obj.disabled = disabled;
    } else {
      messageType = "disabledColumnInfo";
      if(type === "name") {
        if(!column.name) ctx.throw(400, "专栏名已被删除，请刷新");
        obj.name = "";
        obj.nameLowerCase = "";
      } else if(type === "abbr") {
        if(!column.abbr) ctx.throw(400, "专栏简介已被删除，请刷新");
        obj.abbr = "";
      } else if(type === "logo") {
        await db.ColumnModel.updateOne({_id: column._id}, {
          $set: {
            avatar: ''
          }
        });
      } else if(type === "banner") {
        await db.ColumnModel.updateOne({_id: column._id}, {
          $set: {
            banner: ''
          }
        });
      } else if(type === "notice") {
        if(column.noticeDisabled && disabled) ctx.throw(400, "公告通知已被屏蔽，请刷新");
        obj.noticeDisabled = disabled;
      } else if(type === "blocks") {
        if(column.blocksDisabled  && disabled) ctx.throw(400, "自定义内容已被屏蔽，请刷新");
        obj.blocksDisabled = disabled;
      } else if(type === "otherLinks") {
        if(column.otherLinksDisabled  && disabled) ctx.throw(400, "友情链接已被屏蔽，请刷新");
        obj.otherLinksDisabled = disabled;
      }
    }
    await column.updateOne(obj);
    if(disabled) {
      const message = db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        ty: "STU",
        r: column.uid,
        port: ctx.port,
        ip: ctx.address,
        c: {
          type: messageType,
          columnId: column._id,
          columnInfoType: type,
          rea: reason
        }
      });
      await message.save();
      await ctx.nkcModules.socket.sendMessageToUser(message._id);
    } else {
      await column.updateOne({contacted: false});
    }
    await next();
  });
module.exports = router;
