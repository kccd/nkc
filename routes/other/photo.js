const Router = require('koa-router');
const photoRouter = new Router();
const {photoPath, photoSmallPath, sizeLimit} = require('../../settings/index').upload;
const {photoify, photoSmallify} = require('../../tools').imageMagick;
photoRouter
	.get('/:photoId', async (ctx, next) => {
		const {data, db} = ctx;
		const {user, userLevel} = data;
		const {photoId} = ctx.params;
		const photo = await db.PhotoModel.findOnly({_id: photoId});
		if(photo.uid !== user.uid && userLevel < 7) ctx.throw(401, '权限不足');
		ctx.filePath = photoPath + '/' + photo._id + '.jpg';
		await next();
	})
  .post('/', async (ctx, next) => {
    const {data, db, body, fs} = ctx;
    const {user} = data;
    const {files, fields} = body;
    const {photoType} = fields;
    const file = files.file;
    const {size, name, path} = file;
    //if(size > sizeLimit.photo) ctx.throw(400, '图片大小不能超过3M！');
    const photoId = await db.SettingModel.operateSystemID('photos', 1);
    const filePath = '/' + photoId + '.jpg';
    const targetPath = photoPath + filePath;
    const smallTargetPath = photoSmallPath +filePath;
    await photoify(path, targetPath);
    await photoSmallify(path, smallTargetPath);
    await fs.unlink(path);
    const newPhoto = db.PhotoModel({
	    _id: photoId,
			uid: user.uid,
	    type: photoType,
	    fileName: name,
	    size
    });
    await newPhoto.save();
	  data.photoType = photoType;
		data.photoId = photoId;
	  await next();
  })
	.del('/:photoId', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {photoId} = params;
		const photo = await db.PhotoModel.findOnly({_id: photoId});
		const {user} = data;
		if(user.uid !== photo.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		const userPersonal = await db.UsersPersonal.findOnly({uid: user.uid});
		const {privateInfo} = userPersonal;
		if(photo._id === privateInfo.handheldIdCardPhoto) {
			privateInfo.handheldIdCardPhoto = null;
		} else if(photo._id === privateInfo.idCardPhotos[0]) {
			privateInfo.idCardPhotos[0] = null;
		} else if(photo._id === privateInfo.idCardPhotos[1]) {
			privateInfo.idCardPhotos[1] = null;
		} else if(privateInfo.certsPhotos.includes(photo._id)) {
			for(let i = 0; i < privateInfo.certsPhotos.length; i++) {
				const id = privateInfo.certsPhotos[i];
				if(id === photo._id) privateInfo.certsPhotos.splice(i, 1);
			}
		} else if(privateInfo.lifePhotos.includes(photo._id)) {
			for(let i = 0; i < privateInfo.lifePhotos.length; i++) {
				const id = privateInfo.lifePhotos[i];
				if(id === photo._id) privateInfo.lifePhotos.splice(i, 1);
			}
		} else {
			throw ''
		}

		await next();
	});
module.exports = photoRouter;