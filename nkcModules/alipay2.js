/* 
  单笔转账到支付宝账户
  @param options
    account: 收款账户
    name: 收款账户的真实姓名
    id: 系统唯一的转账ID
    money: 转账的金额（元）
    notes: 转账备注，会显示在支付宝账单上
  @author pengxiguaa 2019/3/11
*/
const rp = require('request-promise');
const fs = require('fs');
const queryString = require('querystring');
const moment = require('moment');
const crypto = require('crypto');
const path = require('path');
const alipayConfig = require('../config/alipay.json');
const privatekey = fs.readFileSync(path.resolve(__dirname, '../key/rsa_private_key.pem'));
const publicKey = fs.readFileSync(path.resolve(__dirname, '../key/alipay_public_key.pem'));
const {app_id, url} = alipayConfig;
const serverConfig = require('../config/server.json');

const func = {};
func.transfer = async (o) => {
  const {account, name, id, money, notes} = o;
  if(!account) throwErr('收款方支付宝账号不能为空');
  if(!id) throwErr('支付宝转账ID不能为空');
  if(!name) throwErr('收款方真实姓名不能为空');
  if(!money || money <= 0) throwErr('支付宝转账金额不能小于0');
  if(!notes) throwErr('转账备注不能为空');
  const params = {
    amount: money,
    out_biz_no: id, // 系统唯一订单号
    payee_type: 'ALIPAY_LOGONID', // 对方账号类型 手机号或邮箱
    payee_account: account, // 收款方支付宝账户
    payee_real_name: name, // 收款方真实姓名
    remark: notes // 转账备注
  };
  const options = {
    app_id,
    biz_content: JSON.stringify(params),
    charset: 'UTF-8',
    method: 'alipay.fund.trans.toaccount.transfer',
    sign_type: 'RSA2',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    version: '1.0'
  };
  const str = queryString.unescape(queryString.stringify(options));
  const sign = crypto.createSign('RSA-SHA256');
  sign.write(str);
  sign.end();
  const key = sign.sign(privatekey, 'base64');
  options.sign = key;
  const link = url + '?' + queryString.stringify(options);
  return new Promise((resolve, reject) => {
    rp(link)
      .then((data) => {
        try{
          data = JSON.parse(data);
        } catch(err) {
          return reject(data);
        }
        data = data.alipay_fund_trans_toaccount_transfer_response;
        const {code, sub_msg} = data;
        if(code === '10000') {
          resolve(data);
        } else {
          reject(sub_msg);
        }
      })
      .catch((data) => {
        reject(data);
      });
  });
};
/* 
  收款
  @param options
    money: 收款金额
    id: 唯一ID
    title: 订单标题,
    notes: 订单描述,
    returnUrl: 付款完成浏览器跳转到该url
    backParams: 携带参数，会原样返回
    goodsInfo: [{}]
      goodsName: 商品名
      goodsId: 商品ID
      goodsCount: 商品数量
      goodsPrice: 商品单价
*/
func.receipt = async (o) => {
  let {
    money, id, title, notes, goodsInfo, returnUrl, backParams
  } = o;
  if(!id) throwErr('支付宝收款ID不能为空');
  if(!money || money <= 0) throwErr('支付宝转账金额不能小于0');
  if(!title) throwErr('订单标题不能为空');
  if(!notes) throwErr('订单描述不能为空');
  if(!returnUrl) throwErr('跳转地址不能为空');
  let notifyUrl = `https://soccos.cn/test`;
  if(global.NKC.NODE_ENV === 'production') {
    notifyUrl = `${serverConfig.domain}/finance/recharge`;
  }
  goodsInfo = goodsInfo || [];
  const goods_detail = [];
  for(const g of goodsInfo) {
    let {goodsName, goodsId, goodsCount, goodsPrice} = g;
    if(!goodsName) throwErr(400, '商品名不能为空');
    if(!goodsCount || goodsCount <= 0) throwErr(400, '商品数量不能小于0');
    if(!goodsId)  throwErr(400, '商品ID不能为空');
    if(!goodsPrice || goodsPrice <= 0) throwErr(400 ,'商品单价不能小于0');
    goods_detail.push({
      goods_id: goodsId,
      goods_name: goodsName,
      quantity: Number(goodsCount),
      price: goodsPrice
    });
  }
  const params = {
    body: notes,
    out_trade_no: id,
    passback_params: encodeURI(JSON.stringify(backParams)),
    product_code: 'FAST_INSTANT_TRADE_PAY',
    subject: title,
    total_amount: money
  };
  if(goods_detail.length !== 0) {
    params.goods_detail = goods_detail;
  }
  const options = {
    app_id,
    biz_content: JSON.stringify(params),
    charset: 'UTF-8',
    method: 'alipay.trade.page.pay',
    notify_url: notifyUrl,
    return_url: returnUrl,
    sign_type: 'RSA2',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    version: '1.0'
  };
  const str = queryString.unescape(queryString.stringify(options));
  const sign = crypto.createSign('RSA-SHA256');
  sign.write(str);
  sign.end();
  const key = sign.sign(privatekey, 'base64');
  options.sign = key;
  return url + '?' + queryString.stringify(options);
};

/* 
  验证签名，判断是否为支付宝的请求
  @param notifyData: 支付宝服务器post请求所带的数据
  @author pengxiguaa 2019/3/11 
*/
func.verifySign = async (d) => {
  const notifyData = Object.assign({}, d);
  let data = Object.assign({}, notifyData);
  let sign = data.sign;
  delete data.sign;
  delete data.sign_type;
  const obj = {};
  for(const key of Object.keys(data).sort()) {
    obj[key] = data[key];
  }
  data = queryString.unescape(queryString.stringify(obj));
  const verify = crypto.createVerify('RSA-SHA256');
  verify.write(data);
  verify.end();
  return new Promise((resolve, reject) => {
    if(verify.verify(publicKey, sign, 'base64')) {
      resolve();
    } else {
      const err = new Error('验签失败');
      err.status = 400;
      reject(err);
    }
  });
};
module.exports = func;
/* 
  沙箱测试


1、单笔转账到支付宝账户 
const options = {
  account: 'lihema9158@sandbox.com',
  money: '3',
  id: Date.now(),
  name: '沙箱环境',
  notes: '测试转账模块'
};

  
2、收款
const options  =  {
  id: Date.now(),
  money: '5202',
  title: '沙箱测试收款',
  notes: '沙箱测试收款,订单描述',
  goodsInfo: [
    {
      goodsName: '特斯拉线圈',
      goodsId: '1000212',
      goodsCount: 10,
      goodsPrice: 99.9
    }
  ]
};

3、验签
支付宝 post 请求数据
{ 
  gmt_create: '2019-03-11 12:01:10',
  charset: 'UTF-8',
  gmt_payment: '2019-03-11 12:01:16',
  notify_time: '2019-03-11 12:01:17',
  subject: '沙箱测试收款',
  sign: 'fblWjvLRUyY/DjTJ/gqpU+XOSwUM2r4RdB9ccAJA/3xxwkD2FH3bAGIxSQnZ5/5dQFtRBGWtn9+Z71b+Erou4DxKRObi+BZSYFuYQSUJd9thJiCXHgztEf1CfZJ/9GLyg3fWAvdk7mE7NywI3S8HRYvHlwX8fj4fz6blFGJa5SwqfXO5FWIcFmu+7U3Y7FuZJV3ae6syH9vaO9MK6UUdOBA7/OmyjtzRz2ha5G5LRsEwxlfDpXjM/xiJFH32zRULEFZooV+FNQOPrz3zJhsog2s6Z/nTQu+FfwfGASldQrWnlAkl//eRA6zlx5Kjo3p8BKsI3YBMmqbYbMENwJS0ww==',
  buyer_id: '2088102175621412',
  body: '沙箱测试收款,订单描述',
  invoice_amount: '520.00',
  version: '1.0',
  notify_id: '37c9470a1737df3a22cad4b95f21c25j61',
  fund_bill_list: '[{"amount":"520.00","fundChannel":"ALIPAYACCOUNT"}]',
  notify_type: 'trade_status_sync',
  out_trade_no: '1552276865688',
  total_amount: '520.00',
  trade_status: 'TRADE_SUCCESS',
  trade_no: '2019031122001421410500793265',
  auth_app_id: '2016091100489000',
  receipt_amount: '520.00',
  point_amount: '0.00',
  app_id: '2016091100489000',
  buyer_pay_amount: '520.00',
  sign_type: 'RSA2',
  seller_id: '2088102175198013' 
}













*/