const rp = require('request-promise');
const fs = require('fs');
const queryString = require('querystring');
const moment = require('moment');
const crypto = require('crypto');
const path = require('path');
const directAlipay = require('direct-alipay');
const alipayConfig = require('../config/alipay.json');
const {
  transfer,
  receipt
} = alipayConfig;

const {domain} = require('../config/server.json');

const {seller_id, seller_email, key} = receipt;

directAlipay.config({
  seller_email,
  partner: seller_id,
  key,
  return_url: `${domain}/fund/donation/return`,
  notify_url: `${domain}/fund/donation/verify`
});

const serverConfig = require('../config/server.json');

const receiptConfig = {
  alipay_gateway: 'https://mapi.alipay.com/gateway.do?',
  _input_charset: 'UTF-8',
  sign_type: 'MD5'
};



let privateKey = '', publicKey = '', alipayCertPublicKey = '', alipayRootCert = '', appCertPublicKey = '';
const privateKeyPath = path.resolve(__dirname, '../key/rsa_private_key.pem');
const publicKeyPath = path.resolve(__dirname, '../key/rsa_public_key.pem');
const alipayCertPublicKeyPath = path.resolve(__dirname, '../key/alipayCertPublicKey_RSA2.crt');
const appCertPublicKeyPath = path.resolve(__dirname, '../key/appCertPublicKey.crt');
const alipayRootCertPath = path.resolve(__dirname, '../key/alipayRootCert.crt');
if(fs.existsSync(privateKeyPath)) {
  privateKey = fs.readFileSync(privateKeyPath).toString();
}
if(fs.existsSync(publicKeyPath)) {
  publicKey = fs.readFileSync(publicKeyPath).toString();
}

if(fs.existsSync(alipayCertPublicKeyPath)) {
  alipayCertPublicKey = fs.readFileSync(alipayCertPublicKeyPath).toString();
}
if(fs.existsSync(alipayRootCertPath)) {
  alipayRootCert = fs.readFileSync(alipayRootCertPath).toString();
}
if(fs.existsSync(appCertPublicKeyPath)) {
  appCertPublicKey = fs.readFileSync(appCertPublicKeyPath).toString();
}

const func = {};

func.getDonationDirectAlipay = () => {
  return directAlipay;
}

const AlipaySdk = require('alipay-sdk').default;
let alipaySDK;

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
// 20201210 升级接口 transfer
// 文档地址 https://opendocs.alipay.com/apis/api_28/alipay.fund.trans.uni.transfer
func.transfer = async (o) => {

  if(!alipaySDK) {
    alipaySDK = new AlipaySdk({
      appId: transfer.app_id,
      privateKey: privateKey,
      keyType: 'PKCS1',
      signType: 'RSA2',
      alipayPublicCertContent: alipayCertPublicKey,
      appCertContent: appCertPublicKey,
      alipayRootCertContent: alipayRootCert,
    });
  }

  const {account, name, id, money, notes} = o;
  if(!account) throwErr('收款方支付宝账号不能为空');
  if(!id) throwErr('支付宝转账ID不能为空');
  if(!name) throwErr('收款方真实姓名不能为空');
  if(!money || money < 0.1) throwErr('支付宝转账金额不能小于0.1');
  if(!notes) throwErr('转账备注不能为空');
  const params = {
    trans_amount: money,
    product_code: 'TRANS_ACCOUNT_NO_PWD',
    out_biz_no: id, // 系统唯一订单号
    payee_type: 'ALIPAY_LOGONID', // 对方账号类型 手机号或邮箱
    payee_info: {// 收款方支付宝账户
      identity: account,
      identity_type: 'ALIPAY_LOGON_ID',
      name: name,
    },
    biz_scene: 'DIRECT_TRANSFER',
    remark: notes // 转账备注
  };

  return new Promise((resolve, reject) => {
    alipaySDK.exec(`alipay.fund.trans.uni.transfer`, {
      charset: 'UTF-8',
      biz_content: JSON.stringify(params),
      sign_type: 'RSA2',
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      version: '1.0'
    })
      .then(data => {
        /*error{
          code: '40002',
          msg: 'Invalid Arguments',
          subCode: 'isv.missing-app-cert-sn',
          subMsg: '缺少应用公钥证书序列号'
        }
        success{
          code: '10000',
          msg: 'Success',
          orderId: '111',
          outBizNo: '111',
          payFundOrderId: '111',
          status: 'SUCCESS',
          transDate: '2021-01-19 17:36:14'
        }
        */
        const {code, msg, subCode, subMsg} = data;
        if(code === '10000') {
          resolve(data);
        } else {
          reject(new Error(`${msg} | ${subCode} | ${subMsg}`));
        }
      })
      .catch(err => {
        reject(err);
      })
  });



  const options = {
    app_id: transfer.app_id,
    biz_content: JSON.stringify(params),
    charset: 'UTF-8',
    method: 'alipay.fund.trans.uni.transfer',
    sign_type: 'RSA2',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    version: '1.0'
  };
  const str = queryString.unescape(queryString.stringify(options));
  const sign = crypto.createSign('RSA-SHA256');
  sign.write(str);
  sign.end();
  options.sign = sign.sign(privateKey, 'base64');
  const link = transfer.url + '?' + queryString.stringify(options);
  return new Promise((resolve, reject) => {
    rp(link)
      .then((data) => {
        try{
          data = JSON.parse(data);
        } catch(err) {
          return reject(data);
        }
        data = data.alipay_fund_trans_uni_transfer_response;
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
  options.sign = sign.sign(privateKey, 'base64');
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
