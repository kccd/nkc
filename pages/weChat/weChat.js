const { getDataById } = require('../lib/js/dataConversion');
const { nkcAPI } = require('../lib/js/netAPI');
const { screenTopWarning } = require('../lib/js/topAlert');

$(function () {
  //直接获取data中的prepay_id后拉起支付
  const { info } = getDataById('data');
  const {
    appId,
    timeStamp,
    nonceStr,
    package: packageInfo,
    signType,
    paySign,
  } = info;
  function onBridgeReady() {
    WeixinJSBridge.invoke(
      'getBrandWCPayRequest',
      {
        appId, //公众号ID，由商户传入
        timeStamp, //时间戳，自1970年以来的秒数
        nonceStr, //随机串
        package: packageInfo,
        signType, //微信签名方式：
        paySign, //微信签名
      },
      function (res) {
        if (res.err_msg == 'get_brand_wcpay_request:ok') {
          // 使用以上方式判断前端返回,微信团队郑重提示：
          //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
          updatePaymentStatus('success', '支付已完成');
        } else if (res.err_msg == 'get_brand_wcpay_request:cancel') {
          //支付过程中用户取消
          updatePaymentStatus(
            'fail',
            '用户取消支付，请关闭当前页面重新发起支付',
          );
        } else if (res.err_msg == 'get_brand_wcpay_request:fail') {
          //支付失败
          updatePaymentStatus('fail', '支付失败，请关闭当前页面重新发起支付');
        }
      },
    );
  }
  if (typeof WeixinJSBridge == 'undefined') {
    if (document.addEventListener) {
      document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
    } else if (document.attachEvent) {
      document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
      document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
    }
  } else {
    onBridgeReady();
  }

  function updatePaymentStatus(status, message) {
    $('.record-status-icon').addClass('hidden'); // 隐藏所有状态图标
    if (status === 'success') {
      $('.record-status-icon.success').removeClass('hidden'); // 显示成功状态
      $('#tips').text(message);
    } else if (status === 'fail') {
      $('.record-status-icon.fail').removeClass('hidden'); // 显示失败状态
      $('#tips').text(message);
    }
  }
});
