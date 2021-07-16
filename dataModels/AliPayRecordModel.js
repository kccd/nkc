const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    default: '',
    index: 1,
  },
  status: {
    type: String,
    required: true,
    index: 1
  },
  url: {
    type: String,
    required: true,
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  note: {
    type: String,
    default: ''
  },
  money: {
    type: Number,
    required: true,
  },
  fee: {
    type: Number,
    required: true,
  },
  effectiveMoney: {
    type: Number,
    required: true,
  },
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
  const {verifySign} = require('../nkcModules/alipay2');
  await verifySign(body);
  console.log(body);

};

module.exports = mongoose.model('aliPayRecords',  schema);
