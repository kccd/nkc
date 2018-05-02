const settings = require('../settings');
const fs = require('fs');
const {promisify} = require('util');
const unlink = promisify(fs.unlink);
const mongoose = settings.database;
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
			await photo.update({status: 'outdated'});
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
	if(type !== 'life' && type !== 'cert' && userPersonal.submittedAuth) {
		await this.remove();
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
	if(type !== 'life' && type !== 'cert' && userPersonal.submittedAuth) {
		await this.remove();
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
	await this.update({status: 'deleted'});
	/*
	// 真正的删除照片和数据
	if(type !== 'life' || type !== 'cert') {
		await this.remove();
	} else {
		await this.update({status: 'deleted'});
	}*/
};

photoSchema.post('remove', async function(photo) {
	const {photoPath, photoSmallPath} = require('../settings/upload');
	await unlink(photoPath + this.path);
	await unlink(photoSmallPath + this.path);
});

const PhotoModel = mongoose.model('photos', photoSchema);
module.exports = PhotoModel;