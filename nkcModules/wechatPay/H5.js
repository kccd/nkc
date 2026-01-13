const wechatPayConfigs = require('../../config/wechatPay.json');
const { getHeaderAuthInfo } = require('./utils');
const func = {};

/*
 * 获取h5支付链接，访问链接可唤起手机微信完成支付
 * 待验证，等审核通过后再完善
 * */
func.getH5PaymentUrl = async (props) => {
  const { description, recordId, money, clientIp, attach } = props;
  const timeExpire = new Date(Date.now() + wechatPayConfigs.orderTimeout);
  const data = {
    appid: wechatPayConfigs.appId,
    mchid: wechatPayConfigs.mchId,
    time_expire: timeExpire.toISOString(),
    description,
    out_trade_no: recordId,
    attach,
    notify_url: wechatPayConfigs.notifyUrl,
    amount: {
      currency: 'CNY',
      total: money,
    },
    scene_info: {
      payer_client_ip: clientIp,
      h5_info: {
        type: 'iOSAndroidWap', // ios, android, wap
      },
    },
  };
  const authorization = await getHeaderAuthInfo(
    wechatPayConfigs.H5Url,
    'POST',
    data,
  );
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10 * 1000);
  const res = await fetch(wechatPayConfigs.H5Url, {
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
    const err = new Error(`${res.status} ${code} ${message}`);
    err.status = res.status;
    throw err;
  }

  if (contentType.includes('application/json')) {
    const json = await res.json();
    return json.h5_url;
  }
  return await res.text();
};

module.exports = func;
