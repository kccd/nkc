/**
 * 取消订单
 */
function cancelOrder(orderId) {
  var reason = prompt("【临时理由输入框】请输入取消订单的理由（取消后不可恢复）：", "");
  if(reason === null) return;
  if(reason === '') return screenTopWarning('理由不能为空');
  nkcAPI("/shop/order/"+orderId+"/cancel", "PATCH", {
    reason: reason
  })
  .then(function(data) {
    screenTopAlert("已取消订单");
    window.location.reload();
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  });
}

/**
 * 查看物流信息
 */
function visitLogisticsInfo(orderId) {
  var targetUrl = '/shop/order/'+orderId+'/logistics';
  window.location.href = targetUrl;
}

/**
 * 确认收货
 */
function comfirmReceipt(orderId) {
  nkcAPI('/shop/order/'+orderId+'/receipt', "PATCH", {})
  .then(function(data) {
    screenTopAlert("已确认收货");
    window.location.reload();
  })
  .catch(function(data) {
    screenTopWarning(data || data.error)
  })
}

/**
 * 立即付款
 */
function payNow(orderId) {
  var targetUrl = "/shop/pay?ordersId=" + orderId;
  window.location.href = targetUrl;
}

/**
 * 参与讨论
 * @param {String} threadId 商品所在帖子id
 */
// 取出商品所在得tid
function joinToDiscuss(threadId) {
  var targetUrl = "/t/"+threadId;
  window.location.href = targetUrl;
}
