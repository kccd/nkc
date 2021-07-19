const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  type: { // transfer：转账给用户, directPay: 即时到账
    type: String,
    required: true,
    index: 1
  },
  // 当前记录创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 支付者
  uid: {
    type: String,
    default: '',
    index: 1,
  },
  // 当前记录的状态 waiting
  status: {
    type: String,
    enum: ['waiting', 'success'],
    required: true,
    index: 1
  },
  // 支付页面链接
  url: {
    type: String,
    required: true,
  },
  // 最后操作数据的时间
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
  // 付款金额（分）
  money: {
    type: Number,
    required: true,
  },
  // 手续费 例如 0.006
  fee: {
    type: Number,
    required: true,
  },
  // 实际到账金额 = 付款金额 * 手续费
  effectiveMoney: {
    type: Number,
    required: true,
  },
  // 用户的支付宝账号
  aliPayAccount: {
    type: String,
    default: ''
  },
  // 支付宝交易号
  aliPayId: {
    type: String,
    default: ''
  },
  // 付款者的支付宝唯一 ID
  payerOpenId: {
    type: String,
    default: '',
    index: 1
  },
  // notify_id 与本次通知有关的 ID
  apiLogId: {
    type: String,
    default: ''
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
  collection: 'aliPayRecords'
});

schema.statics.getPaymentRecord = async (props) => {
  const alipay2 = require('../nkcModules/alipay2');
  const checkData = require('../nkcModules/checkData');
  const AliPayRecordModel = mongoose.model('aliPayRecords');
  const SettingModel = mongoose.model('settings');
  const {
    title = '',
    description = '',
    money,
    effectiveMoney,
    fee,
    uid,
    from,
    clientIp,
    clientPort
  } = props;
  checkData.checkNumber(money, {
    name: '支付金额',
    min: 1,
  });
  if(title.length > 256) throw new Error(`订单标题不能超过 256 个字`);
  if(description.length > 256) throw new Error(`订单详情不能超过 1000 个字`);
  const recordId = await SettingModel.getNewId();
  const now = new Date();
  const url = await alipay2.receipt({
    money: money / 100,
    id: recordId,
    title,
    notes: description,
  });
  const aliPayRecord = AliPayRecordModel({
    _id: recordId,
    uid,
    type: 'directPay',
    toc: now,
    tlm: now,
    status: 'waiting',
    url,
    from,
    money,
    effectiveMoney,
    fee,
    ip: clientIp,
    port: clientPort
  });
  await aliPayRecord.save();
  return aliPayRecord;
};


/*
* 验证、解析支付宝回调信息
* */
schema.statics.setRecordStatusByNotificationInfo = async (body) => {
  const AliPayRecordModel = mongoose.model('aliPayRecords');
  const WechatPayRecordModel = mongoose.model('wechatPayRecords');
  const {verifySign} = require('../nkcModules/alipay2');
  await verifySign(body);
  const {
    trade_no,
    buyer_email,
    out_trade_no,
    trade_status,
    buyer_id,
    notify_id
  } = body;
  if(!['TRADE_FINISHED', 'TRADE_SUCCESS'].includes(trade_status)) {
    return;
  }
  const aliPayRecord = await AliPayRecordModel.findOne({_id: out_trade_no});
  if(!aliPayRecord) throwErr(`未找到支付宝订单 out_trade_no: ${out_trade_no}`);
  aliPayRecord.status = 'success';
  aliPayRecord.tlm = new Date();
  aliPayRecord.aliPayAccount = buyer_email;
  aliPayRecord.payerOpenId = buyer_id;
  aliPayRecord.apiLogId = notify_id;
  aliPayRecord.aliPayId = trade_no;
  aliPayRecord.fullData = JSON.stringify(body);
  await aliPayRecord.save();
  await WechatPayRecordModel.toUpdateRecord('aliPay', aliPayRecord._id);
  return aliPayRecord;
};

module.exports = mongoose.model('aliPayRecords',  schema);
