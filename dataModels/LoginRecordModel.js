const mongoose = require('../settings/database');
const collectionName = 'loginRecords';

const schema = mongoose.Schema(
  {
    _id: String,
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    uid: {
      type: String,
      required: true,
      index: 1,
    },
    ip: {
      type: String,
      default: '',
    },
    port: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    collection: collectionName,
  },
);

/*
 * @return {String}
 * */
schema.statics.createLoginRecordId = async () => {
  const SettingModel = mongoose.model('settings');
  return SettingModel.operateSystemID('LoginRecords', 1);
};
/*
 * 创建应用
 * @param {String} ip
 * @param {String} port
 * @param {String} userAgent
 * @param {String} uid
 * @return {LoginRecordDocument}
 * */
schema.statics.createLoginRecord = async (props) => {
  const LoginRecordModel = mongoose.model(collectionName);
  const { uid, ip, port, userAgent } = props;
  const loginRecordId = await LoginRecordModel.createLoginRecordId();
  const client = new LoginRecordModel({
    _id: loginRecordId,
    toc: new Date(),
    uid,
    ip,
    port,
    userAgent,
  });
  await client.save();
  return client;
};

module.exports = mongoose.model(collectionName, schema);
