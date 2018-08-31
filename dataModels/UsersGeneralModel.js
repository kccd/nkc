const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const usersGeneralSchema = new Schema({
	uid: {
		type: String,
		index: 1
  },
  waterSetting:{
    waterAdd: {
      type: Boolean,
      default: true
    },
    waterStyle: {
      type: String,
      default: "siteLogo"
    },
    waterGravity: {
      type: String,
      default: "southeast"
    },
    waterPayTime:{
      type: Date,
      default: null
    },
    waterPayInfo:{
      type: Boolean,
      default: false
    }
  },
  messageSettings: {
    beep: {
      systemInfo: {
        type: Boolean,
        default: false
      },
      reminder: {
        type: Boolean,
        default: false
      },
      usersMessage: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
	collection: 'usersGeneral'
});

const UsersGeneralModel = mongoose.model('usersGeneral', usersGeneralSchema);
module.exports = UsersGeneralModel;
