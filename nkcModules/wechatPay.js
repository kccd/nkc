const axios = require('axios');
const wechatPayConfigs = require('../config/wechatPay.json');
const func = {};

module.exports = func;

func.getPaymentUrl = async (props) => {
  const {
    description, orderId, money
  } = props;
  const timeExpire = new Date(Date.now() + wechatPayConfigs.orderTimeout);
  axios.post(wechatPayConfigs.url, {
    appid: wechatPayConfigs.appId,
    mchid: wechatPayConfigs.mchId,
    time_expire: timeExpire.toISOString(),
    attach: JSON.stringify({orderId}),
    notify_url: wechatPayConfigs.notifyUrl,
    amount: {
      currency: 'CNY',
      total: money,
    },
    description,
  })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
};

