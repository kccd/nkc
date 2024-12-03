const wechatPayConfigs = require('../../config/wechatPay.json');
const { getHeaderAuthInfo } = require('./utils');
const axios = require('axios');
const func = {};

/*
 * 获取jsApi下单获取prepay_id
 * */
func.getJsApiPaymentPrepayID = async (props) => {
  const {
    description,
    recordId,
    money,
    clientIp,
    attach,
    code,
  } = props;
  let openid = '';
  try {
    // 通过code 获取 openid
    const res = await axios({
      method: 'GET',
      url: `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wechatPayConfigs.appId}&secret=${wechatPayConfigs.appsecret}&code=${code}&grant_type=authorization_code`,
    });
    if(res.data.errcode){
      throw {code:res.data.errcode,message:res.data.errmsg};
    }
    openid = res.data.openid;
  } catch (error) {
    let status = 500,
      code = error.code || 'error';
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
    payer : {
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
  return axios({
    method: 'POST',
    url: wechatPayConfigs.jsApiUrl,
    data,
    headers: {
      Authorization: authorization,
    },
  })
    .then((response) => {
      //值有效期为2小时
      return response.data.prepay_id;
    })
    .catch((error) => {
      let status = 500,
        code = 'error',
        message = error.message || '';
      if (error.response) {
        status = error.response.status;
        if (error.response.data) {
          code = error.response.data.code;
          message = error.response.data.message;
        }
      }
      const err = new Error(`${status} ${code} ${message}`);
      err.status = status;
      throw err;
    });
};
func.getCallBackUrl =  (paymentId) => {
  const REDIRECT_URI = encodeURIComponent('https://www.kechuang.org/wx');
  // 以下url是测试使用
  // const REDIRECT_URI = encodeURIComponent('https://www.kechuang.org');
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wechatPayConfigs.appId}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_base&state=${paymentId}#wechat_redirect`;
};

module.exports = func;
