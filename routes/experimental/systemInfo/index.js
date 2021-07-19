const Router = require('koa-router');
const UserModel = require("../../../dataModels/UserModel");
const PostModel = require("../../../dataModels/PostModel");
const ThreadModel = require("../../../dataModels/ThreadModel");
const ColumnModel = require("../../../dataModels/ColumnModel");
const RoleModel = require("../../../dataModels/RoleModel");
const UsersGradeModel = require("../../../dataModels/UsersGradeModel");
const MessageModel = require("../../../dataModels/MessageModel");
const SystemInfoLogModel = require("../../../dataModels/SystemInfoLogModel");

const sysInfoRouter  = new Router();
sysInfoRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = 'experimental/systemInfo/systemInfo.pug';
    data.systemMessages = await db.MessageModel.find({ty: "STE"}).sort({tc: -1});
    data.grades = await UsersGradeModel.find({}, { _id: true, displayName: true }).sort({score: 1});
    data.roles = await RoleModel.find({}, { _id: true, displayName: true }).sort({score: 1});
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body, nkcModules, data} = ctx;
    const { form } = body;
    if(!form.content) ctx.throw(400, '内容不能为空');
    let message;
    const _id = await db.SettingModel.operateSystemID('messages', 1);
    if(form.mode === "broadcast") {
      message = db.MessageModel({
        _id,
        ty: 'STE',
        c: {
          content: form.content,
          mode: "broadcast"
        }
      });
    }
    if(form.mode === "filter") {
      const { lastVisit, roles, grades } = form;
      message = db.MessageModel({
        _id,
        ty: 'STE',
        c: {
          content: form.content,
          mode: "filter",
          lastVisit,
          roles,
          grades
        }
      });
    }
    if(form.mode === "user") {
      const { uids } = form;
      message = db.MessageModel({
        _id,
        ty: 'STE',
        c: {
          content: form.content,
          mode: "user",
          uids
        }
      });
    }
    const doc = await message.save();
    data.message = doc;
    // if(form.mode === "broadcast") {
    //   await db.UsersGeneralModel.updateMany({'messageSettings.chat.systemInfo': false}, {$set: {'messageSettings.chat.systemInfo': true}});
    //   await nkcModules.socket.sendSystemInfoToUser(message._id);
    // }
    await next();
  })
  .put("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const { form } = body;
    if(!form.content) return ctx.throw(400, "通知内容不能为空");
    if(!form.id) return ctx.throw(400, "未接收到消息ID");
    data.content = form.content;
    const result = await db.MessageModel.updateOne({_id: form.id, ty: "STE"}, {
      $set: {
        "c.content": form.content
      }
    });
    if(result.n === 0) return ctx.throw(400, "通知不存在");
    if(result.nModified === 0) return ctx.throw(400, "内容未更改");
    return next();
  })
  .del("/", async (ctx, next) => {
    const { query } = ctx;
    const { id } = query;
    await MessageModel.deleteOne({ _id: id });
    await SystemInfoLogModel.deleteMany({ mid: id });
    return next();
  })
  .get("/fuzzy_search_user", async (ctx, next) => {
    const { query } = ctx.query;
    const { data } = ctx;
    const result = [];
    // 作为用户ID
    const user = await UserModel.findOne({ uid: query }, { uid: true, username: true });
    if(user) {
      result.push({
        label: `uid为${query}的用户: ${user.username}`,
        uid: user.uid
      });
    }
    // 用户名
    const userByUsername = await UserModel.findOne({ username: query }, { uid: true, username: true });
    if(userByUsername) {
      result.push({
        label: `用户: ${userByUsername.username}`,
        uid: userByUsername.uid
      });
    }
    // 评论ID
    const post = await PostModel.findOne({ pid: query }, { uid: true, pid: true });
    if(post) {
      const userByPid = await UserModel.findOne({ uid: post.uid }, { username: true });
      if(userByPid) {
        result.push({
          label: `评论${post.pid}的作者: ${userByPid.username}`,
          uid: post.uid
        });
      }
    }
    // 文章ID
    const thread = await ThreadModel.findOne({ tid: query }, { uid: true, oc: true });
    if(thread) {
      const mainPost = await PostModel.findOne({ pid: thread.oc }, { t: true, uid: true });
      if(mainPost) {
        const title = mainPost.t.length < 10? mainPost.t : mainPost.t.substring(0, 5) + "..." + mainPost.t.substr(-2);
        const userByThread = await UserModel.findOne({ uid: mainPost.uid }, { username: true });
        if(userByThread) {
          result.push({
            label: `文章《${title}》的作者: ${userByThread.username}`,
            uid: mainPost.uid
          });
        }
      }
    }
    // 专栏ID
    const castToNumber = Number(query);
    if(!Number.isNaN(castToNumber)) {
      const column = await ColumnModel.findOne({ _id: castToNumber }, { uid: true, name: true });
      if(column) {
        const userByColumn = await UserModel.findOne({ uid: column.uid }, { username: true });
        if(userByColumn) {
          result.push({
            label: `专栏《${column.name}》的创建者: ${userByColumn.username}`,
            uid: column.uid
          });
        }
      }
    }

    data.result = result;
    return next();
  });
module.exports = sysInfoRouter;
