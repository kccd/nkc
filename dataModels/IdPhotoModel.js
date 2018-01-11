const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const idPhotoSchema = new Schema({
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
  }
},{
  collection: 'idPhotos'
});

idPhotoSchema.pre('save', async function(next) {
	const UsersPersonalModel = require('./UsersPersonalModel');
	const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
	const {privateInfo} = userPersonal;
	const {type, _id} = this;
	switch (type) {
		case '#idCardAPhoto':
			this.type = 'idCardA';
			privateInfo.idCardPhotos[0] = _id;
			break;
		case '#idCardBPhoto':
			this.type = 'idCardB';
			privateInfo.idCardPhotos[1] = _id;
			break;
		case '#handheldIdCardPhoto':
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
});

idPhotoSchema.post('remove', async function(idPhoto) {
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
	const userPersonal = await UsersPersonalModel.findOnly({uid: idPhoto.uid});
	const {idCardPhotos, lifePhotos, certsPhotos} = userPersonal.privateInfo;
	const query = {};
	const type = idPhoto.type;
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
			query['privateInfo.lifePhotos'] = removeByValue(idPhoto._id, lifePhotos);
			break;
		case 'cert':
			query['privateInfo.certsPhotos'] = removeByValue(idPhoto._id, certsPhotos);
			break;
		default:
			throw '未知的照片类型';
	}
	await userPersonal.update(query);
});

const IdPhotoModel = mongoose.model('idPhotos', idPhotoSchema);
module.exports = IdPhotoModel;