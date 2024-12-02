const { getDataById } = require("../lib/js/dataConversion");
const { nkcAPI } = require("../lib/js/netAPI");
const { screenTopWarning } = require("../lib/js/topAlert");
const { playBridge } = require("../lib/js/weChatBridge");

$(function () {
  //直接获取data中的prepay_id后拉起支付
  const {info} = getDataById('data');
  // console.log('====================================');
  // console.log(info);
  // console.log('====================================');
  playBridge(info);
  
});