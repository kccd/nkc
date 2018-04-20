const Router = require('koa-router');
const photoRouter = new Router();
const {photoPath, photoSmallPath, sizeLimit, generateFolderName} = require('../../settings/index').upload;
const {photoify, photoSmallify, lifePhotoify} = require('../../tools').imageMagick;
const path = require('path');
photoRouter
	.get('/:photoId', async (ctx, next) => {
		const {data, db, fs} = ctx;
		const {user, userLevel} = data;
		const {photoId} = ctx.params;
		const photo = await db.PhotoModel.findOnly({_id: photoId});
		if(photo.type === 'fund') {
			// const applicationForm = db.FundApplicationFormModel.findOnly({_id: photo.applicationFormId});
		} else if(photo.uid !== user.uid && userLevel < 7) {
			ctx.throw(403, '权限不足');
		}
		ctx.filePath = photoPath + photo.path;
		if(photo.status === 'deleted') {
			ctx.filePath = path.resolve(__dirname, '../../resources/default_things/deleted_photo.jpg');
		}
		if(photo.status === 'disabled') {
			ctx.filePath = path.resolve(__dirname, '../../resources/default_things/disabled_photo.jpg');
		}
		try{
			await fs.access(ctx.filePath);
		} catch(err) {
			ctx.filePath = path.resolve(__dirname, '../../resources/default_things/deleted_photo.jpg');
		}
		ctx.set('Cache-Control', 'public, no-cache');
		const tlm = await ctx.fs.stat(ctx.filePath);
		ctx.lastModified = new Date(tlm.mtime).toUTCString();
		ctx.type = 'jpg';
		await next();
	})
  .post('/', async (ctx, next) => {
    const {data, db, body, fs} = ctx;
    const {user} = data;
    const {files, fields} = body;
    const {photoType} = fields;
    let type;
		switch(photoType) {
			case 'idCardA':
				type = 'idCardA';
				break;
			case 'idCardB':
				type = 'idCardB';
				break;
			case 'handheldIdCard':
				type = 'handheldIdCard';
				break;
			case 'certs':
				type = 'cert';
				break;
			case 'life':
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
    if((photoType === 'lifePhoto' || photoType === 'certsPhoto' ) && size > 1024*500) {
			await lifePhotoify(targetPath);
    }
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
		if(user.uid !== photo.uid && data.userLevel < 7) ctx.throw(403, '权限不足');
		await photo.removeReference();
		await next();
	});
module.exports = photoRouter;