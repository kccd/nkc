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
    let {type,description} = body;
    const {checkString} = nkcModules.checkData;
    checkString(description, {
      name: '说明',
      minLength: 0,
      maxLength: 5000
    });
    const now = new Date();
    const oldComs = await db.ComplaintTypeModel.find({type: {$in: type}}, {_id: 1});
    const olddescs = await db.ComplaintTypeModel.find({description: {$in: description}}, {_id: 1});
    if(oldComs.length !== 0) {
      ctx.throw(400, `类型 「${type}」 已存在`);
    }
    if(olddescs.length !== 0) {
      ctx.throw(400, `说明 「${description}」 已存在`);
    }
    await db.ComplaintTypeModel.insertCom({
      toc: now,
      uid: state.uid,
      type,
      description
    });
    await next();
  })
  .del('/', async (ctx, next) => {
    const {query, db, data} = ctx;
    const {id} = query;
    await db.ComplaintTypeModel.deleteOne({_id: id});
    await next();
  });
module.exports = router;
