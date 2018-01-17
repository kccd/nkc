const settings = require('../settings');
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
	status: {
  	type: String,
		default: null
	}
},{
  collection: 'photos'
});

const ensureStatus = async (photo) => {
	const {expiryDate, status} = photo;
	if(expiryDate !== null && status === 'passed' && Date.now() > expiryDate) {
		await photo.update({status: 'outdated'})
	}
};

photoSchema.pre('find', async function(next) {
	try{
		await ensureStatus(this);
		await next();
	} catch(err) {
		return next(err);
	}
});

photoSchema.pre('findOne', async function(next) {
	try{
		await ensureStatus(this);
		await next();
	} catch(err) {
		return next(err);
	}
});

photoSchema.pre('save', async function(next) {
	try{
		const PhotoModel = mongoose.model('photos');
		const UsersPersonalModel = require('./UsersPersonalModel');
		const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
		const {privateInfo} = userPersonal;
		const {type, _id} = this;
		const isPassed = async (_id) => {
			if(_id === null) return false;
			const photo = await PhotoModel.findOnly({_id});
			return photo.status === 'passed';
		};
		switch (type) {
			case '#idCardAPhoto':
				if(await isPassed(privateInfo.idCardPhotos[0])) throw '图片已经审核通过，没有必要再上传图片';
				this.type = 'idCardA';
				privateInfo.idCardPhotos[0] = _id;
				break;
			case '#idCardBPhoto':
				if(await isPassed(privateInfo.idCardPhotos[1])) throw '图片已经审核通过，没有必要再上传图片';
				this.type = 'idCardB';
				privateInfo.idCardPhotos[1] = _id;
				break;
			case '#handheldIdCardPhoto':
				if(await isPassed(privateInfo.handheldIdCardPhoto)) throw '图片已经审核通过，没有必要再上传图片';
				this.type = 'handheldIdCard';
				privateInfo.handheldIdCardPhoto = _id;
				break;
			case '#lifePhoto':
				this.type = 'life';
				if(!privateInfo.lifePhotos.includes(_id)) {
					privateInfo.lifePhotos.push(_id);
				}
				break;
			case '#certsPhoto':
				this.type = 'cert';
				if(!privateInfo.certsPhotos.includes(_id)) {
					privateInfo.certsPhotos.push(_id);
				}
				break;
			default:
				throw '未知的图片类型';
		}
		await userPersonal.update({privateInfo});
		await next();
	} catch (err) {
		await next(err);
	}
});

photoSchema.post('remove', async function(photo) {
	const removeByValue = (value, arr) => {
		for (let i in arr) {
			if(arr[i] === value) {
				arr.splice(i, 1);
				break;
			}
		}
		return arr;
	};
	const UsersPersonalModel = require('./UsersPersonalModel');
	const userPersonal = await UsersPersonalModel.findOnly({uid: photo.uid});
	const {idCardPhotos, lifePhotos, certsPhotos} = userPersonal.privateInfo;
	const query = {};
	const type = photo.type;
	switch (type) {
		case 'idCardA':
			idCardPhotos[0] = null;
			query['privateInfo.idCardPhotos'] = idCardPhotos;
			break;
		case 'idCardB':
			idCardPhotos[1] = null;
			query['privateInfo.idCardPhotos'] = idCardPhotos;
			break;
		case 'handheldIdCard':
			query['privateInfo.handheldIdCardPhoto'] = null;
			break;
		case 'life':
			query['privateInfo.lifePhotos'] = removeByValue(photo._id, lifePhotos);
			break;
		case 'cert':
			query['privateInfo.certsPhotos'] = removeByValue(photo._id, certsPhotos);
			break;
		default:
			throw '未知的照片类型';
	}
	await userPersonal.update(query);
});

const PhotoModel = mongoose.model('photos', photoSchema);
module.exports = PhotoModel;