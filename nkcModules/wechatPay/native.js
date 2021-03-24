const axios = require('axios');
const wechatPayConfigs = require('../../config/wechatPay.json');
const {getNotificationInfo, getHeaderAuthInfo} = require('./utils');

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
  const {
    description, recordId, money, attach
  } = props;
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
    out_trade_no: recordId
  };
  const authorization = await getHeaderAuthInfo(wechatPayConfigs.nativeUrl, 'POST', data);
  return axios({
    method: 'POST',
    url: wechatPayConfigs.nativeUrl,
    data,
    headers: {
      'Authorization': authorization
    }
  })
    .then(function (response) {
      return response.data.code_url;
    })
    .catch(function (error) {
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
