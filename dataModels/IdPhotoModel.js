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
	const obj = {};
	const {type, _id} = idPhoto;
	switch (type) {
		case 'idCardA':
			obj['privateInformation.photos.idCardA'] = _id;
			break;
		case 'idCardB':
			obj['privateInformation.photos.idCardB'] = _id;
			break;
		case 'HandheldIdCard':
			obj['privateInformation.photos.handheldIdCard'] = _id;
			break;
		case 'cert':
			obj['privateInformation.photos.certs'] = {$addToSet: _id};
			break;
		default:
			return console.log('未知的证件类型');
	}
	await userPersonal.update(obj);
});


const IdPhotoModel = mongoose.model('idPhotos', idPhotoSchema);
module.exports = IdPhotoModel;