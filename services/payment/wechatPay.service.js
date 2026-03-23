const { getRandomString } = require('../../nkcModules/apiFunction');
const WechatPayRecordModel = require('../../dataModels/WechatPayRecordModel');
const crypto = require('crypto');
const wechatPayConfigs = require('../../config/wechatPay.json');
const FILE = require('../../nkcModules/file');
const fs = require('fs');
const { ThrowCommonError } = require('../../nkcModules/error');
class WechatPayService {
  #getPrivateKey = async () => {
    const privateKeyPath = wechatPayConfigs.certFilePath;
    if (await FILE.access(privateKeyPath)) {
      return (await fs.promises.readFile(privateKeyPath)).toString();
    } else {
      ThrowCommonError(500, `微信证书不存在`);
    }
  };
  #getHeaderAuthInfo = async (url, method, data) => {
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
      method +
      '\n' +
      absoluteUrl +
      '\n' +
      nowTime +
      '\n' +
      randomString +
      '\n' +
      bodyString;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(Buffer.from(content, 'utf-8'));
    const privateKey = await this.#getPrivateKey();
    const signBase64 = sign.sign(privateKey, 'base64');

    return (
      `WECHATPAY2-SHA256-RSA2048 mchid="${wechatPayConfigs.mchId}"` +
      `,nonce_str="${randomString}"` +
      `,signature="${signBase64}"` +
      `,timestamp="${nowTime}"` +
      `,serial_no="${wechatPayConfigs.certNumber}"`
    );
  };

  // 从微信支付服务端获取订单的状态
  #getOrderInfo = async (orderId) => {
    const url = `${wechatPayConfigs.orderUrl}/${orderId}?mchid=${wechatPayConfigs.mchId}`;
    const authorization = await this.#getHeaderAuthInfo(url, 'GET', {});
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10 * 1000);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let code = 'error';
      let message = res.statusText || '';
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          const errJson = await res.json();
          code = errJson.code || code;
          message = errJson.message || message;
        } catch (parseErr) {
          message = `Failed to parse error response: ${parseErr.message}`;
        }
      } else {
        try {
          message = await res.text();
        } catch (textErr) {
          message = `Failed to read error response: ${textErr.message}`;
        }
      }
      ThrowCommonError(res.status, message);
    }

    const resData = await res.json();
    return {
      appid: resData.appid,
      mchid: resData.mchid,
      out_trade_no: resData.out_trade_no,
      transaction_id: resData.transaction_id,
      trade_state: resData.trade_state,
      trade_type: resData.trade_type,
      trade_state_desc: resData.trade_state_desc,
      bank_type: resData.bank_type,
      attach: resData.attach,
      success_time: resData.success_time,
      payer: {
        openid: resData.payer?.openid,
      },
      amount: {
        total: resData.amount?.total,
        payer_total: resData.amount?.payer_total,
        currency: resData.amount?.currency,
        payer_currency: resData.amount?.payer_currency,
      },
    };
  };
  syncRecordStatus = async (recordId) => {
    const record = await WechatPayRecordModel.findOne({ _id: recordId });
    if (!record) {
      ThrowCommonError(400, '支付记录ID（recordId）不正确');
    }
    if (record.status === 'waiting') {
      const info = await this.#getOrderInfo(recordId);
      if (info.trade_state === 'SUCCESS') {
        record.apiLogId = info.transaction_id;
        record.tlm = new Date();
        record.status = 'success';
        record.payerOpenId = info.payer.openid;
        record.fullData = JSON.stringify(info, null, 2);
        await record.save();
        await WechatPayRecordModel.toUpdateRecord('wechatPay', record._id);
      }
    }
  };
}

module.exports = {
  wechatPayService: new WechatPayService(),
};
