const Router = require('koa-router');
const homeTopRouter = new Router();
homeTopRouter
  .get("/", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {tid} = params;
    const homeSettings = await db.SettingModel.getSettings("home");
    const {fixed, movable} = homeSettings.recommendThreads;
    const ads = movable.manuallySelectedThreads.concat(
      movable.automaticallySelectedThreads,
      fixed.manuallySelectedThreads,
      fixed.automaticallySelectedThreads
    );
    const adsId = ads.map(a => a.tid);
    if(adsId.includes(tid)) ctx.throw(400, "文章已经被推送到首页了");
    const thread = await db.ThreadModel.findOnly({tid});
    const firstPost = await db.PostModel.findOnly({pid: thread.oc});
    const posts = await db.PostModel.find({tid, pid: {$ne: thread.oc}}, {pid: 1});
    const postsId = posts.map(post => post.pid);
    const resources = await db.ResourceModel.find({references: firstPost.pid, mediaType: "mediaPicture"}, {rid: 1});
    const postsResources = await db.ResourceModel.find({references: {$in: postsId}, mediaType: "mediaPicture"}, {rid: 1});
    data.thread = {
      title: firstPost.t,
      resourcesId: resources.map(r => r.rid),
      postsResourcesId: postsResources.map(r => r.rid),
      firstPostCover: firstPost.cover,
      tid: thread.tid
    };
    ctx.template = "thread/ad/ad.pug";
    await next();
  })
  .post('/', async (ctx, next) => {
    const {params, db, body, nkcModules} = ctx;
    const {tid} = params;
    const homeSettings = await db.SettingModel.getSettings("home");
    const {movable, fixed} = homeSettings.recommendThreads;
    const ads = movable.manuallySelectedThreads.concat(
      movable.automaticallySelectedThreads,
      fixed.manuallySelectedThreads,
      fixed.automaticallySelectedThreads
    );
    const adsId = ads.map(a => a.tid);
    if(adsId.includes(tid)) ctx.throw(400, "文章已经被推送到首页了");
    const {cover} = body.files;
    const {title, topType} = body.fields;
    if(!["movable", "fixed"].includes(topType)) ctx.throw(400, `指定类型不正确，topType: ${topType}`);
    nkcModules.checkData.checkString(title, {
      name: "标题",
      minLength: 1,
      maxLength: 500
    });
    const aid = await db.AttachmentModel.saveRecommendThreadCover(cover, topType);
    // await nkcModules.file.saveHomeAdCover(cover, topType);
    const newTop = {
      title,
      tid,
      cover: aid,
      // cover: cover.hash,
      type: 'manual', // manual: 手动的, automatic: 自动的
    };
    if(topType === "movable") {
      movable.manuallySelectedThreads.unshift(newTop);
    } else {
      fixed.manuallySelectedThreads.unshift(newTop);
    }
    await db.SettingModel.updateOne({_id: "home"}, {
      $set: {
        "c.recommendThreads.fixed": fixed,
        "c.recommendThreads.movable": movable
      }
    });
    await db.SettingModel.saveSettingsToRedis("home");
    await next();
  })
  .del('/', async (ctx, next) => {
    const {params, db} = ctx;
    const {tid} = params;
    const homeSettings = await db.SettingModel.getSettings("home");
    let {movable, fixed} = homeSettings.recommendThreads;
    for(let i = 0; i < movable.manuallySelectedThreads.length; i++) {
      if(movable.manuallySelectedThreads[i].tid === tid) {
        movable.manuallySelectedThreads.splice(i, 1);
        break;
      }
    }
    for(let i = 0; i < fixed.manuallySelectedThreads.length; i++) {
      if(fixed.manuallySelectedThreads[i].tid === tid) {
        fixed.manuallySelectedThreads.splice(i, 1);
        break;
      }
    }
    for(let i = 0; i < movable.automaticallySelectedThreads.length; i++) {
      if(movable.automaticallySelectedThreads[i].tid === tid) {
        movable.automaticallySelectedThreads.splice(i, 1);
        break;
      }
    }
    for(let i = 0; i < fixed.automaticallySelectedThreads.length; i++) {
      if(fixed.automaticallySelectedThreads[i].tid === tid) {
        fixed.automaticallySelectedThreads.splice(i, 1);
        break;
      }
    }
    await db.SettingModel.updateOne({_id: "home"}, {
      $set: {
        "c.recommendThreads.movable": movable,
        "c.recommendThreads.fixed": fixed
      }
    });
    await db.SettingModel.saveSettingsToRedis("home");
    await next();
  });
module.exports = homeTopRouter;
