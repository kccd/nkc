/**
 * 发货
 * 弹出窗口
 * 确认发货
 * @param {String} orderId 订单号
 * @param {String} storeId 店铺Id
 */
function sendGoods() {
  var storeId = $("#newstoreid").val();
  var orderId = $("#neworderid").val();
  if(!orderId || !storeId) {
    $("#sendGoodsModal").modal("show");
    return screenTopWarning("请重新点击发货");
  }

  var trackNumber = $("#newtracknumber").val().trim();
  if(!trackNumber) return screenTopWarning("请填写快递单号");
  var para = {
    orderId: orderId,
    trackNumber: trackNumber
  }
  nkcAPI('/shop/manage/'+storeId+'/order/sendGoods', "PATCH", {post: para})
  .then(function(data) {
    screenTopAlert("订单发货成功");
    $("#sendGoodsModal").modal("hide");
    window.location.reload();
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  }) 
}

/**
 * 打开弹窗，填写运单号
 * @param {String} orderId  订单号
 * @param {String} storeId  店铺Id
 * 
 */
function openSendGoodsModal(storeId, orderId) {
  $("#sendGoodsModal").modal("show");
  $("#newstoreid").val(storeId);
  $("#neworderid").val(orderId);
}

/**
 * 修改订单
 * @param {String} orderId 订单号
 */
function editOrder() {
  // 获取订单号与店铺ID
  var orderId = $("#eoorderid").val();
  var storeId = $("#eostoreid").val();
  // 获取修改后的商品总价和运费
  var productPrice = $("#eoPrice").val();
  var price = Number(productPrice);
  if(!price || price <= 0 || isNaN(price)) return screenTopWarning("请填写正确的价格后再提交修改")
  price = price * 100;
  var para = {
    price: price,
    orderId: orderId
  }
  // 向服务器发起修改请求
  nkcAPI('/shop/manage/'+storeId+'/order/editOrder', "PATCH", {post:para})
  .then(function(data) {
    screenTopAlert("价格修改成功")
    $("#editOrderModal").modal("hide");
    window.location.reload();
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}

/**
 * 打开弹窗，修改商品价格
 * @param {String} storeId 店铺Id
 * @param {String} orderId 订单Id
 */
function openEditOrderModal(storeId, orderId) {
  $("#editOrderModal").modal("show");
  $("#eostoreid").val(storeId);
  $("#eoorderid").val(orderId);
}

/**
 * 查看物流
 */
function visitLogisticsInfo(orderId) {
  var targetUrl = '/shop/order/'+orderId+'/logistics';
  window.location.href = targetUrl;
}