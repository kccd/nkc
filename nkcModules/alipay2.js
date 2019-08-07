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

const {
  transfer,
  receipt
} = alipayConfig;

const serverConfig = require('../config/server.json');

const receiptConfig = {
  alipay_gateway: 'https://mapi.alipay.com/gateway.do?',
  _input_charset: 'UTF-8',
  sign_type: 'MD5'
};

const privatekey = fs.readFileSync(path.resolve(__dirname, '../key/rsa_private_key.pem'));
const publicKey = fs.readFileSync(path.resolve(__dirname, '../key/alipay_public_key.pem'));


const func = {};
func.transfer = async (o) => {
  const {account, name, id, money, notes} = o;
  if(!account) throwErr('收款方支付宝账号不能为空');
  if(!id) throwErr('支付宝转账ID不能为空');
  if(!name) throwErr('收款方真实姓名不能为空');
  if(!money || money <= 0.1) throwErr('支付宝转账金额不能小于0.1');
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
    app_id: transfer.app_id,
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
  options.sign = sign.sign(privatekey, 'base64');
  const link = transfer.url + '?' + queryString.stringify(options);
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
  收款 电脑网页收款
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
func.receipt1 = async (o) => {
  let {
    money, id, title, notes, goodsInfo, returnUrl, backParams
  } = o;
  if(!id) throwErr('支付宝收款ID不能为空');
  if(!money || money <= 0) throwErr('支付宝转账金额不能小于0');
  if(!title) throwErr('订单标题不能为空');
  if(!notes) throwErr('订单描述不能为空');
  if(!returnUrl) throwErr('跳转地址不能为空');
  let notifyUrl;
  if(global.NKC.NODE_ENV === 'production') {
    notifyUrl = `${serverConfig.domain}/finance/recharge`;
  } else {
    notifyUrl = alipayConfig.notifyUrl || ""
  }
  console.log(notifyUrl);
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
  options.sign = sign.sign(privatekey, 'base64');
  return url + '?' + queryString.stringify(options);
};

/* 
  收款 电脑网页收款 验证签名，判断是否为支付宝的请求
  @param notifyData: 支付宝服务器post请求所带的数据
  @author pengxiguaa 2019/3/11 
*/
func.verifySign1 = async (d) => {
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

const createSign = (obj) => {
  let keys = Object.keys(obj);
  keys = keys.sort();
  const map = {};
  for(const key of keys) {
    if(key !== "sign" && key !== "sign_type" && obj[key]) {
      map[key] = obj[key];
    }
  }
  const str = queryString.unescape(queryString.stringify(map)) + receipt.key;
  return crypto.createHash("MD5").update(str, "UTF-8").digest("hex");
};

/*
* 即时收款
* @param options
*   money: 收款金额
*   id: 唯一ID
*   title: 订单标题,
*   notes: 订单描述,
*   backParams: 携带参数，会原样返回
* @author pengxiguaa 2019-4-8
* */
func.receipt = async (o) => {
  let {
    money, id, title, notes, backParams
  } = o;
  if(!id) throwErr('支付宝收款ID不能为空');
  if(!money || money <= 0) throwErr('支付宝转账金额不能小于0');
  if(!title) throwErr('订单标题不能为空');
  if(!notes) throwErr('订单描述不能为空');
  const returnUrl = serverConfig.domain + '/account/finance/recharge?type=back';
  let notifyUrl;
  if(global.NKC.NODE_ENV === 'production') {
    notifyUrl = `${serverConfig.domain}/account/finance/recharge`;
  } else {
    notifyUrl = alipayConfig.notifyUrl || ""
  }
  const obj = {
    service: "create_direct_pay_by_user",
    payment_type: "1",
    _input_charset: "UTF-8",
    notify_url: notifyUrl,
    partner: receipt.seller_id,
    return_url: returnUrl,
    seller_email: receipt.seller_email
  };
  Object.assign(obj, {
    out_trade_no: id,
    subject: title,
    body: notes,
    total_fee: money,
    extra_common_param: JSON.stringify(backParams)
  });
  obj.sign = createSign(obj);
  obj.sign_type = "MD5";

  return receiptConfig.alipay_gateway + queryString.stringify(obj);
};
/*
即时收款 验证数据
* @param data 页面跳转query或阿里服务器访问时的body
* @author pengxiguaa 2019-4-8
 */
func.verifySign = async (data) => {
  const sign = data.sign;
  const realSign = createSign(data);
  return new Promise((resolve, reject) => {
    if(sign === realSign) {
      const url = receipt.url + queryString.stringify({
        service: "notify_verify",
        partner: receipt.seller_id,
        notify_id: data['notify_id']
      });
      rp(url)
        .then(() => {
          resolve("验证通过");
        })
        .catch((err) => {
          reject(`验证失败：${JSON.stringify(err)}`);
        });
    } else {
      reject(`sign验证不相等：${sign} !== ${realSign}`);
    }
  });
};

module.exports = func;