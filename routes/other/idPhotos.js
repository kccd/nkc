const Router = require('koa-router');
const idPhotosRouter = new Router();
const {idPhotoPath} = require('../../settings/index').upload;
const {idPhotoify} = require('../../tools').imageMagick;
idPhotosRouter
	.get('/:photoId', async (ctx, next) => {
		const {data, db} = ctx;
		const {user, userLevel} = data;
		const {photoId} = ctx.params;
		const photo = await db.IdPhotoModel.findOnly({_id: photoId});
		if(photo.uid !== user.uid && userLevel < 7) ctx.throw(401, '权限不足');
		ctx.filePath = idPhotoPath + '/' + photo._id + '.jpg';
		await next();
	})
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {files, fields} = body;
    const {photoType} = fields;
    const file = files.file;
    const {size, name, path} = file;
    const photoId = await db.SettingModel.operateSystemID('idPhotos', 1);
    const filePath = '/' + photoId + '.jpg';
    const targetPath = idPhotoPath + filePath;
    await idPhotoify(path, targetPath);
    const newIdPhoto = db.IdPhotoModel({
	    _id: photoId,
			uid: user.uid,
	    type: photoType,
	    fileName: name,
	    size
    });
    await newIdPhoto.save();
	  data.photoType = photoType;
		data.photoId = photoId;
	  await next();
  });
module.exports = idPhotosRouter;