const Router = require('koa-router');
const photoRouter = new Router();
const {photoPath, photoSmallPath, sizeLimit, generateFolderName, lifePhotoCount, certPhotoCount} = require('../../settings/index').upload;
const {photoify, photoSmallify, lifePhotoify} = require('../../tools').imageMagick;
const path = require('path');
photoRouter
	.get('/:photoId', async (ctx, next) => {
		const {data, db, fs} = ctx;
		const {user} = data;
		const {photoId} = ctx.params;
		const {disabledPhotoPath, deletedPhotoPath} = ctx.settings.statics;
		const photo = await db.PhotoModel.findOnly({_id: photoId});
		if(photo.type === 'fund') {
			// const applicationForm = db.FundApplicationFormModel.findOnly({_id: photo.applicationFormId});
		} else if(['life', 'cert'].includes(photo.type)) {
			const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid: photo.uid});
			let displayPhoto;
			if(photo.type === 'life') {
				displayPhoto = targetUserPersonal.privacy.lifePhoto;
			} else {
				displayPhoto = targetUserPersonal.privacy.certPhoto;
			}
			if(!user) {
				if(displayPhoto !== 4) {
					ctx.throw(403, '权限不足');
				}
			} else {
				if(user.uid !== photo.uid && !data.userOperationsId.includes('getAnyBodyPhoto')) {
					if(displayPhoto === 0) {
						ctx.throw(403, '权限不足');
					} else if(displayPhoto === 1) {
						const subscribeUsers = await db.SubscribeModel.getUserSubUsersId(photo.uid);
						if (!subscribeUsers.includes(user.uid)) {
							ctx.throw(403, '权限不足');
						}
					} else if(displayPhoto === 2){
						if(user.xsf <= 0) {
							ctx.throw(403, '权限不足');
						}
					} else {

					}
				}
			}
		} else if(!user) {
			ctx.throw(403, '权限不足');
		} else if(photo.uid !== user.uid && !data.userOperationsId.includes('getAnyBodyPhoto')) {
			ctx.throw(403, '权限不足');
		}
		ctx.filePath = photoPath + photo.path;
		if(photo.status === 'deleted') {
			ctx.filePath = deletedPhotoPath;
		}
		if(photo.status === 'disabled') {
			ctx.filePath = disabledPhotoPath;
		}
		try{
			await fs.access(ctx.filePath);
		} catch(err) {
			ctx.filePath = deletedPhotoPath;
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
			case 'cert':
				type = 'cert';
				break;
			case 'life':
				type = 'life';
				break;
			default:
				ctx.throw(400, '未知的图片类型');
		}
	  if(type === 'life') {
		  const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		  const lifePhotos = await userPersonal.extendLifePhotos();
		  if(lifePhotos.length >= lifePhotoCount) {
			  ctx.throw(400, `上传的照片不能超过${lifePhotoCount}张`);
		  }
	  }
	  if(type === 'cert') {
		  const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		  const certsPhotos = await userPersonal.extendCertsPhotos();
		  if(certsPhotos.length >= certPhotoCount) {
			  ctx.throw(400, `上传的证件照片不能超过${certPhotoCount}张`);
		  }
	  }

    const file = files.file;
    const {size, name, path} = file;
    const extArr = name.split('.');
    const ext = extArr[extArr.length-1];
    if(!['jpg', 'jpeg', 'png'].includes(ext.toLowerCase())) {
    	ctx.throw(400, '图片格式只能为jpg、jpeg或png');
    }
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
		if(user.uid !== photo.uid && data.userOperationsId.includes('removeAnyBodyPhoto')) ctx.throw(403, '权限不足');
		await photo.removeReference();
		await next();
	});
module.exports = photoRouter;
