const wechatPayConfigs = require('../../config/wechatPay.json');
const {getHeaderAuthInfo} = require('./utils');
const axios = require('axios');
const func = {};

/*
* 获取h5支付链接，访问链接可唤起手机微信完成支付
* 待验证，等审核通过后再完善
* */
func.getH5PaymentUrl = async (props) => {
  const {description, recordId, money, clientIp, attach} = props;
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
      total: money
    },
    scene_info: {
      payer_client_ip: clientIp,
      h5_info: {
        type: 'iOSAndroidWap' // ios, android, wap
      }
    }
  };
  const authorization = await getHeaderAuthInfo(wechatPayConfigs.H5Url, 'POST', data);
  return axios({
    method: 'POST',
    url: wechatPayConfigs.H5Url,
    data,
    headers: {
      'Authorization': authorization
    }
  })
    .then(response => {
      return response.data.h5_url;
    })
    .catch(error => {
      let status = 500, code = 'error', message = error.message || '';
      if(error.response) {
        status = error.response.status;
        if(error.response.data) {
          code = error.response.data.code;
          message = error.response.data.message;
        }
      }
      const err = new Error(`${status} ${code} ${message}`);
      err.status = status;
      throw err;
    });
};

module.exports = func;
