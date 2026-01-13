const wechatPayConfigs = require('../../config/wechatPay.json');
const { getHeaderAuthInfo } = require('./utils');

const func = {};

module.exports = func;

/*
 * 获取微信支付二维码链接
 * @param {Object} props
 *   @param {String} recordId 自定义唯一订单号
 *   @param {Number} money 金额 正整数 单位 分
 *   @param {String} description 商品描述
 *
 * */
func.getNativePaymentUrl = async (props) => {
  const { description, recordId, money, attach } = props;
  const timeExpire = new Date(Date.now() + wechatPayConfigs.orderTimeout);

  const data = {
    appid: wechatPayConfigs.appId,
    mchid: wechatPayConfigs.mchId,
    time_expire: timeExpire.toISOString(),
    attach,
    notify_url: wechatPayConfigs.notifyUrl,
    amount: {
      currency: 'CNY',
      total: money,
    },
    description,
    out_trade_no: recordId,
  };
  const authorization = await getHeaderAuthInfo(
    wechatPayConfigs.nativeUrl,
    'POST',
    data,
  );
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10 * 1000);
  const res = await fetch(wechatPayConfigs.nativeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(data),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    let status = res.status;
    let code = 'error';
    let message = res.statusText || '';
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
    const err = new Error(`${status} ${code} ${message}`);
    err.status = status;
    throw err;
  }

  if (contentType.includes('application/json')) {
    const json = await res.json();
    return json.code_url;
  }
  return await res.text();
};
