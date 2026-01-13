const wechatPayConfigs = require('../../config/wechatPay.json');
const { getHeaderAuthInfo } = require('./utils');
const func = {};

/*
 * 获取jsApi下单获取prepay_id
 * */
func.getJsApiPaymentPrepayID = async (props) => {
  const { description, recordId, money, clientIp, attach, code } = props;
  let openid = '';
  try {
    // 通过code 获取 openid
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10 * 1000);
    const oauthUrl = new URL(
      'https://api.weixin.qq.com/sns/oauth2/access_token',
    );
    oauthUrl.searchParams.set('appid', wechatPayConfigs.appId);
    oauthUrl.searchParams.set('secret', wechatPayConfigs.appsecret);
    oauthUrl.searchParams.set('code', code);
    oauthUrl.searchParams.set('grant_type', 'authorization_code');
    const res = await fetch(oauthUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      // 尝试解析错误响应
      let message = res.statusText || '';
      try {
        const errJson = await res.json();
        message = errJson.errmsg || message;
      } catch (parseErr) {
        message = `Failed to parse error response: ${parseErr.message}`;
      }
      const err = new Error(`${res.status} error ${message}`);
      err.status = res.status;
      throw err;
    }
    const json = await res.json();
    if (json.errcode) {
      throw { code: json.errcode, message: json.errmsg };
    }
    openid = json.openid;
  } catch (error) {
    let status = 500,
      code = error.code || 'error',
      message = error.message || '';
    const err = new Error(`${code} ${message}`);
    err.status = status;
    throw err;
  }
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
    //必填信息
    payer: {
      openid,
    },
    // 选填
    scene_info: {
      payer_client_ip: clientIp,
    },
  };
  const authorization = await getHeaderAuthInfo(
    wechatPayConfigs.jsApiUrl,
    'POST',
    data,
  );
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10 * 1000);
  const res = await fetch(wechatPayConfigs.jsApiUrl, {
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
  //值有效期为2小时
  if (contentType.includes('application/json')) {
    const json = await res.json();
    return json.prepay_id;
  }
  return await res.text();
};
func.getCallBackUrl = (paymentId) => {
  const REDIRECT_URI = encodeURIComponent('https://www.kechuang.org/wx');
  // 以下url是测试使用
  // const REDIRECT_URI = encodeURIComponent('https://www.kechuang.org');
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wechatPayConfigs.appId}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_base&state=${paymentId}#wechat_redirect`;
};

module.exports = func;
