const Router = require('koa-router');
const RtRouter = new Router();
const {thumbnailPath, defaultThumbnailPath, uploadPath} = require('../../settings/upload');
const fs = require('fs');
const {accessSync} = fs;
const path = require('path');
RtRouter
  .get('/:rid', async (ctx, next) => {
    const {rid} = ctx.params;
    const {data, db} = ctx;
    const {user} = data;
    const targetResource = await db.ResourceModel.findOnly({rid});
    const extension = targetResource.ext;
    const extArr = ['jpg', 'jpeg', 'gif', 'png', 'svg'];
    let url = '';
    const defaultUrl = path.resolve(__dirname, `../../resources/default_things/default_thumbnail.png`);
    if(extArr.includes(extension) && targetResource.tpath) {
      url = path.resolve(__dirname, thumbnailPath + '/' + targetResource.tpath);
      try{
        accessSync(url);
      } catch (e) {
        url = defaultUrl;
      }
    } else {
      url = defaultUrl;
    }
    ctx.filePath = url;
    await next();
  });
module.exports = RtRouter;