const Router = require('koa-router');
const photoRouter = new Router();
const {photoPath, photoSmallPath, sizeLimit, generateFolderName} = require('../../settings/index').upload;
const {photoify, photoSmallify} = require('../../tools').imageMagick;
photoRouter
	.get('/:photoId', async (ctx, next) => {
		const {data, db} = ctx;
		const {user, userLevel} = data;
		const {photoId} = ctx.params;
		const photo = await db.PhotoModel.findOnly({_id: photoId});
		if(photo.type === 'fund') {

		}
		if(photo.uid !== user.uid && userLevel < 7) ctx.throw(401, '权限不足');

		ctx.filePath = photoPath + photo.path;
		await next();
	})
  .post('/', async (ctx, next) => {
    const {data, db, body, fs} = ctx;
    const {user} = data;
    const {files, fields} = body;
    const {photoType} = fields;
    let type;
		switch(photoType) {
			case '#idCardAPhoto':
				type = 'idCardA';
				break;
			case '#idCardBPhoto':
				type = 'idCardB';
				break;
			case '#handheldIdCardPhoto':
				type = 'handheldIdCard';
				break;
			case '#certsPhoto':
				type = 'cert';
				break;
			case '#lifePhoto':
				type = 'life';
				break;
			default:
				ctx.throw(400, '未知的图片类型');
		}
    const file = files.file;
    const {size, name, path} = file;
    if(size > sizeLimit.photo) ctx.throw(400, '图片大小不能超过20M！');
    const photoId = await db.SettingModel.operateSystemID('photos', 1);
    const filePath = photoId + '.jpg';
    const photoDir = generateFolderName(photoPath);
    const photoSmallDir = generateFolderName(photoSmallPath);
    const targetPath = photoPath + photoDir + filePath;
    const smallTargetPath = photoSmallPath + photoSmallDir + filePath;
    await photoify(path, targetPath);
    await photoSmallify(path, smallTargetPath);
    await fs.unlink(path);
    const newPhoto = db.PhotoModel({
	    _id: photoId,
			uid: user.uid,
	    fileName: name,
	    path: photoDir + filePath,
	    size,
	    type
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
		await photo.removeReference();
		await next();
	});
module.exports = photoRouter;