const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {query, db, data, nkcModules} = ctx;
    const {page=0, t} = query;
    let q;
    if(t === "resolved") {
      q = {
        resolved: true
      };
    } else if(t === "unresolved") {
      q = {
        resolved: false
      };
    } else {
      q = {}
    }
    data.t = t;
    const count = await db.ComplaintModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const complaints = await db.ComplaintModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.complaints = await db.ComplaintModel.extendComplaints(complaints);
    data.complaints.map(c => {
      c.type_ = ctx.state.lang("complaintTypes", c.type);
      c.reasonType_ = ctx.state.lang("complaintTypes", c.reasonType);
    });
    data.paging = paging;
    ctx.template = "complaint/complaints.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {tools, nkcModules, db, body, data} = ctx;
    const {user} = data;
    const complaintCount = await db.ComplaintModel.count({
      uid: user.uid,
      toc: {
        $gte: nkcModules.apiFunction.today()
      }
    });
    if(complaintCount >= 50) ctx.throw(400, "您今天的发起的投诉实在是太多啦~");
    const {type, id, reasonType, reasonDescription} = body;
    if(!id) ctx.throw(400, "出现了一个错误，因为服务器不明白投诉内容的ID是什么~");
    if(!type) ctx.throw(500, "出现了一个错误，因为服务器不明白投诉的类型~");
    if(!reasonType) ctx.throw(400, "请选择投诉类型");
    if(tools.checkString.contentLength(reasonDescription) > 500) ctx.throw(400, "投诉原因太长了，请精简一下~");
    await db.ComplaintModel({
      _id: await db.SettingModel.operateSystemID("complaints", 1),
      uid: user.uid,
      type,
      reasonDescription,
      reasonType,
      contentId: id
    }).save();
    await next();
  })
  .post("/resolve", async (ctx, next) =>{
    const {tools, data, db, body} = ctx;
    const {result, _id, complaints} = body;
    const time = Date.now();
    const {user} = data;
    if(_id) {
      const complaint = await db.ComplaintModel.findById(_id);
      if(complaint.resolved) ctx.throw(400, "投诉记录已处理，请勿重复提交");
      await complaint.update({
        $set: {
          resolved: true,
          handlerId: user.uid,
          resolveTime: time,
          result
        }
      });
      data.complaint = (await db.ComplaintModel.findById(_id)).toObject();
      data.complaint.handler = await db.UserModel.findOne({uid: data.complaint.handlerId}, {uid: 1, username: 1});
    } else {
      data.complaints = [];
      for(const c of complaints) {
        const {_id, result} = c;
        const complaint = await db.ComplaintModel.findById(_id);
        if(complaint.resolved) continue;
        await complaint.update({
          $set: {
            resolved: true,
            handlerId: user.uid,
            resolveTime: time,
            result
          }
        });
        const complaint_ = (await db.ComplaintModel.findById(_id)).toObject();
        complaint_.handler = await db.UserModel.findOne({uid: complaint_.handlerId}, {uid: 1, username: 1});
        data.complaints.push(complaint_);
      }
    }
    await next();
  });
module.exports = router;