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
  // 付款金额 = 实际到账金额 * ( 1 + 平台手续费 )
  money: {
    type: Number,
    required: true,
  },
  // 平台手续费
  fee: {
    type: Number,
    required: true
  },
  // 实际到账金额（分）
  effectiveMoney: {
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
  },
  // 调用当前支付的模块
  from: {
    type: String, // score: 用户积分模块（充值、购买商品）, fund：基金相关（赞助、退款）
    required: true
  }
}, {
  collection: 'wechatPayRecords'
});

/*
* 获取H5支付链接
* @param {Object} props
*   @param {String} description 简介 1-127(不知是字节还是字符个数)
*   @param {String} money 待付款金额（分）
*   @param {String} uid 付款者ID
*   @param {String} apiType 接口类型 H5或native
*   @param {Object} attach 自定义数据
*   @param {String} from 调用支付的模块 score, fund
* @return {Object} 当前支付记录
* @author pengxiguaa 2021-03-17
* */
schema.statics.getPaymentRecord = async (props) => {
  const WechatPayRecordModel = mongoose.model('wechatPayRecords');
  const checkData = require('../nkcModules/checkData');
  const SettingModel = mongoose.model('settings');
  const {H5, native} = require('../nkcModules/weChatPay');
  const {
    description = '',
    money,
    effectiveMoney,
    fee,
    uid,
    apiType,
    from,
    clientIp,
    clientPort,
  } = props;
  if(!['native', 'H5'].includes(apiType)) throwErr(400, `微信支付apiType error`);
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
  const weChatPayRecord = WechatPayRecordModel({
    _id: recordId,
    uid,
    toc: now,
    tlm: now,
    status: 'waiting',
    apiType,
    url,
    attach,
    from,
    money,
    effectiveMoney,
    fee,
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
  const WechatPayRecordModel = mongoose.model('wechatPayRecords');
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
  const weChatPayRecord = await WechatPayRecordModel.findOne({_id: out_trade_no});
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
  await weChatPayRecord.toUpdateRecord();
  return weChatPayRecord;
};


/*
* 更新与当前支付记录相关联的账单（积分账单、基金账单）
* */
schema.methods.toUpdateRecord = async function() {
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const FundBillModel = mongoose.model('fundBills');
  const {_id, status, from} = this;
  if(status !== 'success') return;
  if(from === 'score') {
    const kcbsRecord = await KcbsRecordModel.findOne({paymentId: _id, paymentType: 'wechatPay'});
    if(kcbsRecord) await kcbsRecord.verifyPass();
  } else if(from === 'fund') {
    const fundBill = await FundBillModel.findOne({paymentId: _id, paymentType: 'wechatPay'});
    if(fundBill) await fundBill.verifyPass();
  }
}

module.exports = mongoose.model('wechatPayRecords', schema);
