const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data}=ctx;
    const complaintTypes = await db.ComplaintTypeModel.find().sort({toc: 1});
    const usersId = [];
    for(const c of complaintTypes) {
      if(!c.uid) continue;
      usersId.push(c.uid);
    }
    data.complaintTypes = [];
    const usersObj = await db.UserModel.getUsersObjectByUsersId(usersId);
    for(let type of complaintTypes) {
      type = type.toObject();
      if(type.uid) {
        const u = usersObj[type.uid];
        type.user = {
          avatar: u.avatar,
          uid: u.uid,
          username: u.username
        };
      }
      data.complaintTypes.push(type);
    }
    data.complaintSettings = await db.SettingModel.getSettings('complaint');
    ctx.template = "experimental/settings/complaint/complaint.pug";
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {complaintSettings} = body;
    const {checkString} = nkcModules.checkData;
    checkString(complaintSettings.tip, {
      name: '投诉提示',
      minLength: 0,
      maxLength: 5000
    });
    await db.SettingModel.updateOne({_id: 'complaint'}, {
      $set: {
        'c.tip': complaintSettings.tip
      }
    });
    await db.SettingModel.saveSettingsToRedis('complaint');
    await next();
  })
  .post('/type', async (ctx, next) => {
    const {state, db, body, nkcModules} = ctx;
    let {type, description, disabled, _id, uid} = body;
    const {checkString} = nkcModules.checkData;
    checkString(description, {
      name: '说明',
      minLength: 0,
      maxLength: 5000
    });
    const now = new Date();
    const oldComs = await db.ComplaintTypeModel.find({type: {$in: type}}, {_id: 1});
    if(oldComs.length !== 0) {
      ctx.throw(400, `类型 「${type}」 已存在`);
    }
    await db.ComplaintTypeModel.insertCom({
      toc: now,
      uid: state.uid,
      type,
      description,
      disabled
    });
    await next();
  })
  .put('/type', async (ctx, next) => {
    const {state, db, body, nkcModules} = ctx;
    let {type, description, disabled, _id, uid, operation} = body;
    const id = await db.ComplaintTypeModel.findOne({_id});
		if(!id) ctx.throw(400, "未找到相关数据，请刷新页面后重试");
    const oldComs = await db.ComplaintTypeModel.find({type: {$in: type}}, {_id: 1});
    if(oldComs.length === 1) {
      if(operation === "modifyDisabled") {
        await id.updateOne({
          disabled: !!disabled
        });
      } else if(operation === "modifyEdit") {
        if(!!type) {
          await id.updateOne({description: description, type: type});
        }
      } 
    } else if(oldComs.length === 0){
      ctx.throw(400, `类型 「${type}」 不存在`);
    } else {
      ctx.throw(400, `类型 「${type}」 存在多个，请联系管理员`);
    }
    await next();
  });
module.exports = router;
