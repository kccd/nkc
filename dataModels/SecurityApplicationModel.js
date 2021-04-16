const mongoose = require('../settings/database');

const schema = new mongoose.Schema({
  _id: String,
  // 申请人ID
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 常用登录地址 1到3个
  addresses: {
    type: [String],
    default: []
  },
  // 旧手机号
  oldPhoneNumber: {
    nationCode: {
      type: String,
      required: true,
      default: ''
    },
    number: {
      type: String,
      required: true,
      default: ''
    }
  },
  // 新手机号
  newPhoneNumber: {
    nationCode: {
      type: String,
      required: true,
      default: ''
    },
    number: {
      type: String,
      required: true,
      default: ''
    }
  },
  // 申请表创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 提交申请时ip地址 需要通过IPModel查询真正的IP地址
  ip: {
    type: String,
    default: ''
  },
  // 提交申请时ip地址
  port: {
    type: String,
    default: ''
  },
  // 处理的时间
  tlm: {
    type: Date,
    default: null
  },
  // 处理人
  mUid: {
    type: String,
    default: '',
    index: 1
  },
  // 管理员批准通过后所填写的备注，用户不可见
  remarks: {
    type: String,
    default: ''
  },
  // 管理员驳回后所填写的理由，会随短消息发送给用户
  reason: {
    type: String,
    default: ''
  },
  // 当前申请的状态 pending: 等待处理, resolved: 通过, rejected: 驳回
  status: {
    type: String,
    default: 'pending',
    index: 1
  },
  // 申诉者填写的申诉说明
  description: {
    type: String,
    default: ''
  }
}, {
  collection: 'securityApplications'
});

/*
* 创建一条申请
* @param {Object} props
*   @param {String} ip
*   @param {String} port
*   @param {String} uid 申请人ID
*   @param {Object} oldPhoneNumber {nationCode: String, number: String} 旧手机号
*   @param {Object} newPhoneNumber {nationCode: String, number: String} 新手机号
*   @param {[String]} addresses 常用登录地址
* @return {Object} 申请对象
* @author pengxiguaa 2021-1-8
* */
schema.statics.createApplication = async (props) => {
  const SettingModel = mongoose.model('settings');
  const IPModel = mongoose.model('ips');
  const SecurityApplicationModel = mongoose.model('securityApplications');
  const {checkString} = require('../nkcModules/checkData');
  const {
    ip: address, port, uid, oldPhoneNumber, newPhoneNumber,
    addresses, description
  } = props;
  if(addresses.length < 1) throwErr(400, `请至少选择一个常用登录地址`);
  if(addresses.length > 3) throwErr(400, `最多选择三个常用登录地址`);
  for(const a of addresses) {
    checkString(a, {
      name: '常用登录地址',
      minLength: 1,
      maxLength: 50
    });
  }
  const _id = await SettingModel.newObjectId();
  const ip = await IPModel.saveIPAndGetToken(address);
  const securityApplication = SecurityApplicationModel({
    _id,
    ip,
    port,
    uid,
    addresses,
    oldPhoneNumber,
    description,
    newPhoneNumber
  });
  await securityApplication.save();
  return securityApplication;
};

/*
* 获取未处理的申请
* @param {String} uid 用户ID
* @return {Object} application对象或null
* @author pengxiguaa 2021-1-8
* */
schema.statics.getPendingApplication = async (uid) => {
  const SecurityApplicationModel = mongoose.model('securityApplications');
  return await SecurityApplicationModel.findOne({
    uid,
    status: 'pending'
  });
};
module.exports = mongoose.model('securityApplications', schema);
