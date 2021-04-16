const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 用户ID
  uid: {
    type: String,
    default: '',
    index: 1
  },
  // 状态
  status: {
    type: String,
    enum: ['waiting', 'success', 'fail', 'timeout'],
    required: true,
    index: 1
  },
  // 微信支付api名称
  apiType: {
    type: String,
    enum: ['H5', 'native'],
    required: true,
    index: 1,
  },
  // 支付链接
  url: {
    type: String,
    required: true,
  },
  // 调用微信api，有关此次调用记录的id，用于提供给微信排查问题
  apiLogId: {
    type: String,
    default: ''
  },
  // 自定义数据
  attach: {
    type: String,
    default: ''
  },
  // 状态最后更改时间 付款成功、付款失败和付款超时
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 付款失败时的错误信息
  note: {
    type: String,
    default: ''
  },
  // 付款者信息
  payerOpenId: {
    type: String,
    default: '',
    index: 1
  },
  // 付款金额（分）
  money: {
    type: Number,
    required: true,
  },
  // 付款者IP地址
  ip: {
    type: String,
    default: '',
    index: 1
  },
  // 付款者IP地址对应端口
  port: {
    type: String,
    default: '',
    index: 1
  },
  // 支付通知的完整数据
  fullData: {
    type: String,
    default: ''
  }
}, {
  collection: 'weChatPayRecords'
});

/*
* 获取H5支付链接
* @param {Object} props
*   @param {String} description 简介 1-127(不知是字节还是字符个数)
*   @param {String} money 待付款金额（分）
*   @param {String} uid 付款者ID
*   @param {String} apiType 接口类型 H5或native
*   @param {Object} attach 自定义数据
* @return {Object} 当前支付记录
* @author pengxiguaa 2021-03-17
* */
schema.statics.getPaymentRecord = async (props) => {
  const WeChatPayModel = mongoose.model('weChatPayment');
  const checkData = require('../nkcModules/checkData');
  const SettingModel = mongoose.model('settings');
  const {H5, native} = require('../nkcModules/weChatPay');
  const {
    description = '',
    money,
    uid,
    apiType,
    clientIp,
    clientPort,
  } = props;
  if(!['H5', 'native'].includes(apiType)) throwErr(500, `weChatPay apiType error. apiType: ${apiType}`);
  checkData.checkNumber(money, {
    name: '支付金额',
    min: 1,
  });
  const recordId = await SettingModel.getNewId();
  const attach = JSON.stringify(props.attach || {});
  let url;

  if(apiType === 'H5') {
    url = await H5.getH5PaymentUrl({
      clientIp,
      description,
      recordId,
      money,
      attach,
    });
  } else if(apiType === 'native') {
    url = await native.getNativePaymentUrl({
      description,
      recordId,
      money,
      attach,
    });
  }

  const now = new Date();
  const weChatPayRecord = WeChatPayModel({
    _id: recordId,
    uid,
    toc: now,
    tlm: now,
    status: 'waiting',
    apiType,
    url,
    attach,
    money,
    ip: clientIp,
    port: clientPort
  });
  await weChatPayRecord.save();
  return weChatPayRecord;
};

/*
* 解析微信支付通知
*
* */
schema.statics.setRecordStatusByNotificationInfo = async (body) => {
  const WeChatPaymentModel = mongoose.model('weChatPayment');
  const {utils} = require('../nkcModules/weChatPay');
  const dataStr = await utils.getNotificationInfo(body);
  const data = JSON.parse(dataStr);
  const {
    out_trade_no,
    transaction_id,
    trade_state,
    trade_state_desc,
    payer,
  } = data;
  const weChatPayRecord = await WeChatPaymentModel.findOne({_id: out_trade_no});
  if(!weChatPayRecord) throwErr(400, `微信支付记录「${out_trade_no}」不存在`);
  if(weChatPayRecord.status !== 'waiting') throwErr(400, `微信支付记录「${out_trade_no}」状态已过期`);
  let status;
  let note = '';
  if(trade_state === 'SUCCESS') {
    status = 'success';
  } else {
    status = 'fail';
    note = `${trade_state} ${trade_state_desc}`;
  }
  weChatPayRecord.apiLogId = transaction_id;
  weChatPayRecord.tlm = new Date();
  weChatPayRecord.payerOpenId = payer.openid;
  weChatPayRecord.status = status;
  weChatPayRecord.note = note;
  weChatPayRecord.fullData = dataStr;
  await weChatPayRecord.save();
  await weChatPayRecord.toUpdateKcbsRecord();
  return weChatPayRecord;
};

schema.methods.toUpdateKcbsRecord = async function() {
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const {_id, status} = this;
  if(status !== 'success') return;
  const kcbsRecord = await KcbsRecordModel.findOne({paymentId: _id, paymentType: 'weChat'});
  if(!kcbsRecord) return;
  await kcbsRecord.verifyPass();
}

module.exports = mongoose.model('weChatPayment', schema);
