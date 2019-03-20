/**
 * 取消订单
 */
function cancelOrder(orderId) {
  var confirmCancel = window.confirm("订单取消后将不可恢复,您确定要取消？");
  if(confirmCancel){
    nkcAPI("/shop/order/"+orderId+"/cancel", "PATCH", {})
    .then(function(data) {
      screenTopAlert("已取消订单");
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data || data.error);
    })
  }
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
    screenTopAlert("已确认收货")
  })
  .catch(function(data) {
    screenTopWarning(data || data.error)
  })
}

// /**
//  * 立即付款
//  */
// function 

/**
 * 参与讨论
 * @param {String} threadId 商品所在帖子id
 */
// 取出商品所在得tid
function joinToDiscuss(threadId) {
  var targetUrl = "/t/"+threadId;
  window.location.href = targetUrl;
}
