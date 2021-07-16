const rp = require('request-promise');
const fs = require('fs');
const queryString = require('querystring');
const moment = require('moment');
const crypto = require('crypto');
const AlipaySdk = require('alipay-sdk').default;

const alipayConfig = require('../config/alipay.json');
const serverConfig = require('../config/server.json');

let privateKey = '';
let publicKey = '';
let alipayCertPublicKey = '';
let alipayRootCert = '';
let appCertPublicKey = '';

const {
  privateKeyPath,
  publicKeyPath,
} = alipayConfig.receipt;
const {
  alipayCertPublicKeyPath,
  alipayRootCertPath,
  appCertPublicKeyPath
} = alipayConfig.transfer;

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

async function transfer(o) {
  const alipaySDK = new AlipaySdk({
    appId: alipayConfig.transfer.app_id,
    privateKey: privateKey,
    keyType: 'PKCS1',
    signType: 'RSA2',
    alipayPublicCertContent: alipayCertPublicKey,
    appCertContent: appCertPublicKey,
    alipayRootCertContent: alipayRootCert,
  });

  const {account, name, id, money, notes} = o;
  if(!account) throwErr('收款方支付宝账号不能为空');
  if(!id) throwErr('支付宝转账ID不能为空');
  if(!name) throwErr('收款方真实姓名不能为空');
  if(!money || money <= 0.1) throwErr('支付宝转账金额不能小于0.1');
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
}

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

/*
* 即时收款
* @param options
*   money: 收款金额
*   id: 唯一ID （AliPayRecordModel ID）
*   title: 订单标题,
*   notes: 订单描述,
*   backParams: 携带参数，会原样返回
* @author pengxiguaa 2019-4-8
* */
async function receipt(o) {
  let {
    money,
    id,
    title = '',
    notes = '',
    backParams = ''
  } = o;
  if(!id) throwErr('支付宝收款ID不能为空');
  if(money > 0) {

  } else {
    throwErr('支付宝金额错误');
  }

  const returnUrl = serverConfig.domain + '/payment/alipay/' + id;

  const obj = {
    service: "create_direct_pay_by_user",
    payment_type: "1",
    _input_charset: "UTF-8",
    notify_url: alipayConfig.receipt.notifyUrl,
    partner: alipayConfig.receipt.seller_id,
    return_url: returnUrl,
    seller_email: alipayConfig.receipt.seller_email
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

  return alipayConfig.receipt.url + queryString.stringify(obj);
}
/*
即时收款 验证数据
* @param data 页面跳转query或阿里服务器访问时的body
* @author pengxiguaa 2019-4-8
 */
async function verifySign(data) {
  const sign = data.sign;
  const realSign = createSign(data);
  return new Promise((resolve, reject) => {
    if(sign === realSign) {
      const url = alipayConfig.receipt.url + queryString.stringify({
        service: "notify_verify",
        partner: alipayConfig.receipt.seller_id,
        notify_id: data['notify_id']
      });
      rp(url)
        .then(() => {
          resolve("验证通过");
        })
        .catch((err) => {
          console.log(`验证失败`);
          console.log(err);
          reject(err);
        });
    } else {
      reject(new Error(`sign验证不相等：${sign} !== ${realSign}`));
    }
  });
}

function createSign(obj) {
  let keys = Object.keys(obj);
  keys = keys.sort();
  const map = {};
  for(const key of keys) {
    if(key !== "sign" && key !== "sign_type" && obj[key]) {
      map[key] = obj[key];
    }
  }
  const str = queryString.unescape(queryString.stringify(map)) + alipayConfig.receipt.key;
  return crypto.createHash("MD5").update(str, "UTF-8").digest("hex");
}

module.exports = {
  transfer,
  receipt,
  verifySign
};
