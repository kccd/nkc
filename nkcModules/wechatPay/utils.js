const wechatPayConfigs = require('../../config/wechatPay.json');
const {getRandomString} = require('../apiFunction');
const fs = require('fs');
const crypto = require('crypto');
// const privateKey = fs.readFileSync(wechatPayConfigs.certFilePath).toString();
const FILE = require('../file');
const func = {};

func.getPrivateKey = async () => {
  const privateKeyPath = wechatPayConfigs.certFilePath;
  if(await FILE.access(privateKeyPath)) {
    return (await fs.promises.readFile(privateKeyPath)).toString();
  } else {
    throwErr(500, `微信证书不存在`);
  }
}


/*
* 解密来自微信的请求
* @param {Object} body 请求body
* @return {String} 解密结果
* */
func.getNotificationInfo = async (body) => {
  const {
    id,
    create_time,
    resource_type,
    event_type,
    summary,
    resource,
  } = body;
  const {
    ciphertext,
    associated_data: associatedData,
    nonce,
  } = resource;

  const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
  const authTag = ciphertextBuffer.slice(ciphertextBuffer.length - 16);
  const data = ciphertextBuffer.slice(0, ciphertextBuffer.length - 16);
  const decipherIv = crypto.createDecipheriv('aes-256-gcm', wechatPayConfigs.APIv3, nonce);
  decipherIv.setAuthTag(Buffer.from(authTag));
  decipherIv.setAAD(Buffer.from(associatedData));
  const decryptStr = decipherIv.update(data, null, 'utf-8');
  decipherIv.final();
  return decryptStr;
};

/*
* 获取验证信息
* @param {String} url
* @param {String} method
* @param {Object} data 请求body
* @return {String}
* */
func.getHeaderAuthInfo = async (url, method, data) => {
  method = method.toUpperCase();
  let absoluteUrl = new URL(url);
  absoluteUrl = absoluteUrl.pathname + absoluteUrl.search;
  const nowTime = Math.floor(Date.now() / 1000);
  const randomString = getRandomString(`A0`, 32);
  let bodyString;
  if (method === 'GET') {
    bodyString = '\n';
  } else {
    bodyString = JSON.stringify(data) + '\n';
  }
  const content =
    method + '\n' +
    absoluteUrl + '\n' +
    nowTime + '\n' +
    randomString + '\n' +
    bodyString;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(Buffer.from(content, 'utf-8'));
  const privateKey = await func.getPrivateKey();
  console.log(privateKey);
  const signBase64 = sign.sign(privateKey, 'base64');

  return (`WECHATPAY2-SHA256-RSA2048 mchid="${wechatPayConfigs.mchId}"` +
    `,nonce_str="${randomString}"` +
    `,signature="${signBase64}"` +
    `,timestamp="${nowTime}"` +
    `,serial_no="${wechatPayConfigs.certNumber}"`);
};

module.exports = func;
