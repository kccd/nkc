const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data}=ctx;
    data.complaintTypes=await db.ComplaintTypeModel.find().sort({toc:-1})
    ctx.template = "experimental/settings/complaintType/complaintType.pug";
    await next();
  })
  .post('/', async (ctx, next) => {
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
  .put('/', async (ctx, next) => {
     const {state, db, body, nkcModules} = ctx;
     let {type, description, disabled, _id, uid, operation} = body;
     const id = await db.ComplaintTypeModel.findOne({_id});
		if(!id) ctx.throw(400, "未找到相关数据，请刷新页面后重试");
    const oldComs = await db.ComplaintTypeModel.find({type: {$in: type}}, {_id: 1});
    if(oldComs.length = 1) {
      if(operation === "modifyDisabled") {
        await id.updateOne({
          disabled: !!disabled
        });
      } else if(operation === "modifyEdit") {
        if(!!type) {
          await id.updateOne({description: description, type: type});
        }
      } 
    }else if(oldComs.length = 0){
      ctx.throw(400, `类型 「${type}」 不存在`);
    }else {
      ctx.throw(400, `类型 「${type}」 存在多个，请联系管理员`);
    }
    })

  // .del('/', async (ctx, next) => {
  //   const {query, db, data} = ctx;
  //   const {id} = query;
  //   await db.ComplaintTypeModel.deleteOne({_id: id});
  //   await next();
  // });
module.exports = router;
