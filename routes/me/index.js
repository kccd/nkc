const Router = require('koa-router');
const meRouter = new Router();

meRouter
  .get('/resource', async (ctx, next) => {
    const {user} = ctx.data;
    const {db} = ctx;
    const quota = parseInt(ctx.query.quota);
    ctx.data.resources = await db.ResourceModel.find({uid: user.uid}).sort({toc: -1}).limit(quota);
    await next();
  })
  .get('/media', async (ctx, next) => {
    const {user} = ctx.data;
    const {db, data, nkcModules} = ctx;
    let {quota, skip, type, c} = ctx.query;
    if(!c) c = "all";
    quota = parseInt(quota);
    skip = parseInt(skip);
    let queryMap;
    if(type === "all") {
      queryMap = {"uid": user.uid};
    }else if(type === "picture") {
      queryMap = {"uid": user.uid, "mediaType": "mediaPicture"};
    }else if(type === "video") {
      queryMap = {"uid": user.uid, "mediaType": "mediaVideo"};
    }else if(type === "audio") {
      queryMap = {"uid": user.uid, "mediaType": "mediaAudio"};
    }else{
      queryMap = {"uid": user.uid, "mediaType": "mediaAttachment"};
    }
    if(c === "unused") {
      queryMap["references.0"] = {$exists: false};
    } else if(c === "used") {
      queryMap["references.0"] = {$exists: true};
    }
    queryMap.type = "resource";
    let newSkip = quota * skip;
    let mediaCount = await db.ResourceModel.find(queryMap).countDocuments();
    data.paging = nkcModules.apiFunction.paging(skip, mediaCount, quota);
    let maxSkip = Math.ceil(mediaCount / quota);
    if(maxSkip < 1) maxSkip = 1;
    if(skip >= maxSkip){
      ctx.data.skip = maxSkip - 1;
    }else{
      ctx.data.skip = skip;
    }
    if(newSkip > mediaCount) {
      ctx.throw(400, '已经是最后一页了')
    }
    ctx.data.maxSkip = maxSkip;
    ctx.data.resources = await db.ResourceModel.find(queryMap).sort({toc: -1}).skip(newSkip).limit(quota);
    const uploadSettings = await db.SettingModel.getSettings('upload');
    data.sizeLimit = uploadSettings.sizeLimit;
    await next();
  })
	.get('/life_photos', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.lifePhotos = await userPersonal.extendLifePhotos();
		await next();
	});

module.exports = meRouter;
