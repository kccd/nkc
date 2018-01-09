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
  timeToCreate: {
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

idPhotoSchema.post('save', async function(idPhoto) {
	const UsersPersonalModel = require('./UsersPersonalModel');
	const userPersonal = await UsersPersonalModel.findOnly({uid: idPhoto.uid});
	const {privateInfo} = userPersonal;
	const {type, _id} = idPhoto;
	switch (type) {
		case '#idCardAPhoto':
			privateInfo.idCardPhotos[0] = _id;
			break;
		case '#idCardBPhoto':
			privateInfo.idCardPhotos[1] = _id;
			break;
		case '#handheldIdCardPhoto':
			privateInfo.handheldIdCardPhoto = _id;
			break;
		case '#lifePhoto':
			if(!privateInfo.lifePhotos.includes(_id)) {
				privateInfo.lifePhotos.push(_id);
			}
			break;
		case '#certsPhoto':
			if(!privateInfo.certsPhotos.includes(_id)) {
				privateInfo.certsPhotos.push(_id);
			}
			break;
		default:
			throw '未知的图片类型';
	}
	await userPersonal.update({privateInfo});
});


const IdPhotoModel = mongoose.model('idPhotos', idPhotoSchema);
module.exports = IdPhotoModel;