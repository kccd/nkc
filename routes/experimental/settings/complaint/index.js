const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data}=ctx;
    const complaintTypes = await db.ComplaintTypeModel.find().sort({order: 1});
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
    const {complaintSettings, complaintTypesId} = body;
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
    for(let i = 0; i < complaintTypesId.length; i++) {
      await db.ComplaintTypeModel.updateOne({_id: complaintTypesId[i]}, {
        $set: {
          order: i + 1
        }
      });
    }
    await db.SettingModel.saveSettingsToRedis('complaint');
    await next();
  })
  .post('/type', async (ctx, next) => {
    const {state, db, body, nkcModules} = ctx;
    let {type, description} = body;
    const {checkString} = nkcModules.checkData;
    checkString(type, {
      name: '投诉类型名称',
      minLength: 0,
      maxLength: 20
    });
    checkString(description, {
      name: '投诉类型说明',
      minLength: 0,
      maxLength: 5000
    });
    const count = await db.ComplaintTypeModel.countDocuments({type});
    if(count > 0) {
      ctx.throw(400, `类型 「${type}」 已存在`);
    }
    await db.ComplaintTypeModel.insertCom({
      uid: state.uid,
      type,
      description,
    });
    await next();
  })
  .put('/type', async (ctx, next) => {
    const {state, db, body, nkcModules} = ctx;
    const {checkString} = nkcModules.checkData;
    let {type, description, disabled, _id, operation} = body;
    const complaintType = await db.ComplaintTypeModel.findOne({_id});
		if(!complaintType) ctx.throw(400, "未找到相关数据，请刷新页面后重试");
    if(operation === 'modifyDisabled') {
      await complaintType.updateOne({
        $set: {
          disabled: !!disabled
        }
      });
    } else if(operation === 'modifyEdit') {
      checkString(type, {
        name: '投诉类型名称',
        minLength: 0,
        maxLength: 20
      });
      checkString(description, {
        name: '投诉类型说明',
        minLength: 0,
        maxLength: 5000
      });
      const sameTypeCount = await db.ComplaintTypeModel.countDocuments({_id: {$ne: _id}, type});
      if(sameTypeCount > 0) {
        ctx.throw(400, `投诉类型名称已存在`);
      }
      await complaintType.updateOne({
        $set: {
          type,
          description
        }
      });
    } else {
      ctx.throw(400, `数据错误 operation: ${operation}`);
    }
    await next();
  });
module.exports = router;
