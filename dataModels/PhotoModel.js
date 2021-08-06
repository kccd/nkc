const fs = require('fs');
const fsPromises = fs.promises;
const {promisify} = require('util');
const unlink = promisify(fs.unlink);
const mongoose = require('../settings/database');
const {generateFolderName, photoPath, photoSmallPath} = require("../settings/upload");
const Schema = mongoose.Schema;
const photoSchema = new Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
	type: {
  	type: String,
		required: true,
		index: 1
	},
	applicationFormId: {
		type: Number,
		default: null
	},
	path: {
		type: String,
		required: true
	},
  size: {
    type: Number,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
	expiryDate: {
		type: Date,
		default: null
	},
	// null: 未处理
	// passed: 通过
	// notPassed: 未通过,
	// outdated： 失效
	// disabled: 封禁
	// deleted: 已被删除的
	status: {
  	type: String,
		default: null
	},
	description: {
  	type: String,
		default: null
	}
},{
  collection: 'photos'
});

const ensureStatus = async (photo) => {
	if(photo) {
		const {expiryDate, status} = photo;
		if(expiryDate !== null && status === 'passed' && Date.now() > expiryDate) {
			await photo.updateOne({status: 'outdated'});
			photo.status = 'outdated';
		}
	}
};

photoSchema.post('find', async function(photo, next) {
	try{
		await ensureStatus(photo);
		await next();
	} catch(err) {
		const error = new Error(err);
		error.status = 500;
		await next(error);
	}
});

photoSchema.post('findOne', async function(photo, next) {
	try{
		await ensureStatus(photo);
		await next();
	} catch(err) {
		const error = new Error(err);
		error.status = 500;
		await next(error);
	}
});

photoSchema.pre('save', async function(next) {
	const err = '该证件照已通过审核，请勿更改！';
	const {type, uid} = this;
	const UsersPersonalModel = require('./UsersPersonalModel');
	const userPersonal = await UsersPersonalModel.findOnly({uid});
	const authLevel = await userPersonal.getAuthLevel();
	if(type !== 'fund' && type !== 'life' && type !== 'cert' && userPersonal.submittedAuth) {
		await this.deleteOne();
		return next(new Error('正在等待审核，请勿修改图片！'));
	}
	const {idCardA, idCardB, handheldIdCard} = await userPersonal.extendIdPhotos();
	if(type === 'idCardA') {
		if(authLevel < 1)
			return next(new Error(`请先完成身份认证${authLevel+1}`));
		if(idCardA && idCardA.status === 'passed')
			return next(new Error(err));
	}
	if(type === 'idCardB') {
		if(authLevel < 1)
			return next(new Error(`请先完成身份认证${authLevel+1}`));
		if(idCardB && idCardB.status === 'passed')
			return next(new Error(err));
	}
	if(type === 'handheldIdCard') {
		if(authLevel < 2)
			return next(new Error(`请先完成身份认证${authLevel+1}`));
		if(handheldIdCard && handheldIdCard.status === 'passed')
			return next(new Error(err));
	}
	await next();
});

photoSchema.methods.removeReference = async function() {
	const err = '删除失败！不能删除已通过审核的证件照！';
	const UsersPersonalModel = require('./UsersPersonalModel');
	const {type, uid} = this;
	const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
	if(type !== 'fund' && type !== 'life' && type !== 'cert' && userPersonal.submittedAuth) {
		await this.deleteOne();
		return next(new Error('正在等待审核，请勿修改图片！'));
	}
	const {idCardA, idCardB, handheldIdCard} = userPersonal.extendIdPhotos();
	if(type === 'idCardA' && idCardA && idCardA.uid === uid && idCardA.status === 'passed') {
		return next(new Error(err));
	}
	if(type === 'idCardB' && idCardB && idCardB.uid === uid && idCardB.status === 'passed') {
				return next(new Error(err));
	}
	if(type === 'handheldIdCard' && handheldIdCard && handheldIdCard.uid === uid && handheldIdCard.status === 'passed') {
				return next(new Error(err));
	}
	// 没有真正的删除照片和数据
	await this.updateOne({status: 'deleted'});
	/*
	// 真正的删除照片和数据
	if(type !== 'life' || type !== 'cert') {
		await this.deleteOne();
	} else {
		await this.updateOne({status: 'deleted'});
	}*/
};

photoSchema.post('remove', async function(photo) {
	const {photoPath, photoSmallPath} = require('../settings/upload');
	await unlink(photoPath + this.path);
	await unlink(photoSmallPath + this.path);
});


/*
* 复制图片到基金申请
* 如果图片本来就属于基金申请则不作任何处理且返回图片 ID
* 如果图片不属于基金申请则生成图片数据并将文件复制一份保存成基金申请图片，最后返回基金申请图片 ID
* @param {String} uid 申请人 ID
* @param {[Number]} photosId 图片 ID 组成的数组
* @param {Number} applicationFormId 基金申请表 ID
* @return {「Number」} 基金申请图片 ID 组成的数组
* */
photoSchema.statics.copyLifePhotosToFund = async (uid, applicationFormId, photosId) => {
  const PhotoModel = mongoose.model('photos');
  const SettingModel = mongoose.model('settings');
  const photos = await PhotoModel.find({
    _id: {$in: photosId},
    uid,
    status: {
      $nin: ['disabled', 'deleted'],
    }
  });
  const photosObj = {};
  for(const p of photos) {
    photosObj[p._id] = p;
  }

  const newPhotosId = [];

  for(const id of photosId) {
    const photo = photosObj[id];
    if(!photo) continue;
    // 如果本来就是基金申请中的图片则不作任何处理
    if(photo.type === 'fund') {
      newPhotosId.push(id);
      continue;
    }
    const {photoPath, photoSmallPath, generateFolderName} = require('../settings/upload');
    const newId = await SettingModel.operateSystemID('photos', 1);
    const {size, uid, fileName, description} = photo;
    const photoDir = generateFolderName(photoPath);
    const photoSmallDir = generateFolderName(photoSmallPath);
    const filePath = newId + '.jpg';
    const targetPath = photoPath + photoDir + filePath;
    const smallTargetPath = photoSmallPath + photoSmallDir+ filePath;
    await fsPromises.copyFile(photoPath + photo.path, targetPath);
    await fsPromises.copyFile(photoSmallPath + photo.path, smallTargetPath);
    const newPhoto = new PhotoModel({
      _id: newId,
      type: 'fund',
      path: photoDir + filePath,
      applicationFormId,
      uid,
      size,
      fileName,
      description
    });
    await newPhoto.save();
    newPhotosId.push(newId);
  }

  return newPhotosId;
};

/*
* 删除基金申请的图片
* @param {Number} applicationFormId 基金申请表 ID
* @param {[Number]} 基金申请表图片 ID 组成的数组
* */
photoSchema.statics.removeApplicationFormPhotosById = async (uid, applicationFormId, photosId) => {
  const PhotoModel = mongoose.model('photos');
  await PhotoModel.updateMany({
    uid,
    type: 'fund',
    applicationFormId,
    _id: {
      $in: photosId
    }
  }, {
    $set: {
      status: 'deleted'
    }
  });
};

const PhotoModel = mongoose.model('photos', photoSchema);
module.exports = PhotoModel;