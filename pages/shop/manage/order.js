function test() {
  alert("1")
}
/**
 * 发货
 * 弹出窗口
 * 确认发货
 * @param {String} orderId 订单号
 * @param {String} sellUid 卖家uId
 */
function sendGoods() {
  var sellUid = $("#newstoreid").val();
  var orderId = $("#neworderid").val();
  var trackName = $("#trackList").val();
  if(!orderId || !sellUid) {
    $("#sendGoodsModal").modal("show");
    return screenTopWarning("请重新点击发货");
  }

  var trackNumber = $("#newtracknumber").val().trim();
  if(!trackNumber) return screenTopWarning("请填写快递单号");
  var para = {
    orderId: orderId,
    trackNumber: trackNumber,
    trackName: trackName
  }
  nkcAPI('/shop/manage/'+sellUid+'/order/sendGoods', "PATCH", {post: para})
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
 * @param {String} sellUid  卖家uid
 * 
 */
function openSendGoodsModal(sellUid, orderId) {
  $("#sendGoodsModal").modal("show");
  $("#newstoreid").val(sellUid);
  $("#neworderid").val(orderId);
}


/**
 * 修改订单
 * @param {String} orderId 订单号
 */
function editOrder() {
  // 获取订单号与店铺ID
  var orderId = $("#eoorderid").val();
  var sellUid = $("#eostoreid").val();
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
  nkcAPI('/shop/manage/'+sellUid+'/order/editOrder', "PATCH", {post:para})
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
 * @param {String} sellUid 卖家Uid
 * @param {String} orderId 订单Id
 */
function openEditOrderModal(sellUid, orderId) {
  $("#editOrderModal").modal("show");
  $("#eostoreid").val(sellUid);
  $("#eoorderid").val(orderId);
}


/**
 * 查看物流
 */
function visitLogisticsInfo(sellUid,orderId) {
  var targetUrl = '/shop/manage/'+sellUid+'/order/logositics?orderId='+orderId;
  window.location.href = targetUrl;
}


/**
 * 修改运单号
 */
function editTrackNum() {
  $("#editTrackNum").css("display", "none");
  $("#saveTrackNum").css("display", "inline-block");
  var trackNumber = $("#trakcNumText").text();
  var infoPutDom = "<input type='text' id='trackNumVal' value='"+trackNumber+"'>";
  $("#trakcNumText").html(infoPutDom);

}


 /**
  * 保存运单号修改
  */
function saveTrackNum(sellUid,orderId) {
  var trackNumber = $("#trackNumVal").val().trim();
  nkcAPI('/shop/manage/'+sellUid+'/order/editOrderTrackNumber', "PATCH", {orderId: orderId, trackNumber: trackNumber})
  .then(function(data) {
    screenTopAlert("修改成功");
    $("#saveTrackNum").css("display", "none");
    $("#editTrackNum").css("display", "inline-block");
    $("#trakcNumText").html(trackNumber);
  })
  .catch(function(data) {
    screenTopWarning(data.error || data)
  })
}


/**
 * 修改卖家备注
 */
function editSellMessage(uid,orderId) {
  var sellMessage = $("#sellMessage" + orderId).text().trim();
  if(sellMessage.length == 0) {
    return screenTopWarning("不填写备注无需保存");
  }
  nkcAPI('/shop/manage/'+uid+'/order/editSellMessage', "PATCH", {sellMessage: sellMessage, orderId: orderId})
  .then(function(data) {
    screenTopAlert("备注修改成功");
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  })
}


/**
 * 修改商品单价
 */
function editProductSinglePrice(sellUid, orderId, paraId) {
  $("#productSinglePriceDom"+paraId).css("display", "")
  $("#productSinglePriceValue"+paraId).val(100)
  // 隐藏修改按钮，并显示保存按钮
  $("#editPriceBtn"+paraId).css("display", "none");
  $("#savePriceBtn"+paraId).css("display", "");

  $("#productSinglePriceValue"+paraId).bind("input propertychange", function(){
    if(Number($("#productSinglePriceValue"+paraId).val()) > 999) {
      $("#productSinglePriceValue"+paraId).val(999)
    }else if(Number($("#productSinglePriceValue"+paraId).val()) < 0) {
      $("#productSinglePriceValue"+paraId).val(1)
    }
    var result = numToFloatTwo((Number($("#productSinglePriceValue"+paraId).val())/100) * Number($("#productSinglePrice"+paraId).text())*100);
    // 计算差值
    // $("#productSingleDiff"+paraId).text(Number($("#productSinglePriceResult"+paraId).text())-Number(result))
    $("#productSinglePriceResult"+paraId).text(result);
  })
}


/**
 * 保存折后价
 */
function saveProductSinglePrice(sellUid, orderId, costId) {
  $("#productSinglePriceValue"+costId).val(100)
  $("#productSinglePriceDom"+costId).css("display", "none");
  // 计算差值
  var result = Number($("#productSinglePriceResult"+costId).text());
  var originResult = Number($("#productSinglePrice"+costId).text());
  var resultDiff = (result - originResult) * Number($("#productSingleCount"+costId).text());
  // 取出商品总价、运费、订单总价
  var productTotalPrice = Number($("#productTotalPrice"+orderId).text());
  var productFreightPrice = Number($("#productFreightPrice"+orderId).text());
  var orderTotalPrice = Number($("#orderTotalPrice"+orderId).text());
  // 隐藏保存按钮，并显示修改按钮
  $("#editPriceBtn"+costId).css("display", "");
  $("#savePriceBtn"+costId).css("display", "none");

  // 输出修改后结果
  $("#productSinglePrice"+costId).text(result);
  // 修改商品总价
  $("#productTotalPrice"+orderId).text(numToFloatTwo((productTotalPrice+resultDiff)*100));
  // 修改订单总价
  productTotalPrice = Number($("#productTotalPrice"+orderId).text());
  $("#orderTotalPrice"+orderId).text(numToFloatTwo((productTotalPrice+productFreightPrice)*100));

  var costObj = {
    singlePrice: Number($("#productSinglePrice"+costId).text()) *100,
    count: Number($("#productSingleCount"+costId).text())
  };
  var orderObj = {
    orderPrice: Number($("#productTotalPrice"+orderId).text())*100,
    orderFreightPrice: Number($("#productFreightPrice"+orderId).text())*100
  }
  var postObj = {
    costId: costId,
    orderId: orderId,
    costObj: costObj,
    orderObj: orderObj
  };
  nkcAPI('/shop/manage/'+sellUid+'/order/editCostRecord', "PATCH", postObj)
  .then(function(data) {
    screenTopAlert("保存成功");
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  })
}


/**
 * 修改运费
 */
function editOrderFreightPrice(sellUid,orderId) {
  $("#editFreightBtn"+orderId).css("display", "none");
  $("#saveFreightBtn"+orderId).css("display", "");
  var orderFreightPrice = Number($("#productFreightPrice"+orderId).text());
  var inputDom = "<input id='productFreightPriceInput"+orderId+"' type='text' value='"+orderFreightPrice+"' style='width:13%'>";
  $("#productFreightPrice"+orderId).html(inputDom);
}


/**
 * 保存运费修改
 */
function saveOrderFreightPrice(sellUid, orderId) {
  $("#editFreightBtn"+orderId).css("display", "");
  $("#saveFreightBtn"+orderId).css("display", "none");
  var newFreightPrice = $("#productFreightPriceInput" + orderId).val();
  newFreightPrice = Number(newFreightPrice);
  $("#productFreightPrice"+orderId).html(numToFloatTwo(newFreightPrice*100));
  // 修改订单总价
  var productTotalPrice = Number($("#productTotalPrice"+orderId).text());
  $("#orderTotalPrice"+orderId).text(numToFloatTwo((productTotalPrice+newFreightPrice)*100));
  var orderObj = {
    orderPrice: Number($("#productTotalPrice"+orderId).text())*100,
    orderFreightPrice: Number($("#productFreightPrice"+orderId).text())*100
  }
  var postObj = {
    orderId: orderId,
    orderObj: orderObj
  }
  nkcAPI('/shop/manage/'+sellUid+'/order/editOrderPrice', "PATCH", postObj)
  .then(function(data) {
    screenTopAlert("保存成功");
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  })
}


/**
 * 修改数量
 */
function editOrderProductCount(sellUid, costId, orderId) {
  $("#editCountBtn"+costId).css("display", "none");
  $("#saveCountBtn"+costId).css("display", "");
  var productCount = Number($("#productSingleCount"+costId).text());
  var productCountDom = "<input id='productCountInput"+costId+"' type='text' value='"+productCount+"' style='width:13%'>";
  $("#productSingleCount"+costId).html(productCountDom);
}


/**
 * 保存数量修改
 */
function saveOrderProductCount(sellUid, costId, orderId) {
  $("#editCountBtn"+costId).css("display", "");
  $("#saveCountBtn"+costId).css("display", "none");
  var newProductCount = Number($("#productCountInput"+costId).val());
  if(isNaN(newProductCount) || newProductCount < 0) {
    newProductCount = 1;
  }
  // 获取当前商品单价、 运费、 商品总价、订单总价、并计算出商品总价以及订单总价
  var singlePrice = Number($("#productSinglePrice"+costId).text());
  var productSingleCountHis = Number($("#productSingleCountHis"+costId).text());
  var productTotalPrice = Number($("#productTotalPrice"+orderId).text());
  var productFreightPrice = Number($("#productFreightPrice"+orderId).text());
  
  var countDiff = newProductCount - productSingleCountHis;
  var totalPriceDiff = countDiff * singlePrice;
  productTotalPrice += totalPriceDiff;

  $("#productSingleCount"+costId).text(newProductCount);
  $("#productSingleCountHis"+costId).text(newProductCount);
  $("#productTotalPrice"+orderId).text(productTotalPrice);
  $("#orderTotalPrice"+orderId).text(numToFloatTwo((productTotalPrice + productFreightPrice)*100));

  var costObj = {
    singlePrice: Number($("#productSinglePrice"+costId).text()) *100,
    count: Number($("#productSingleCount"+costId).text())
  };
  var orderObj = {
    orderPrice: Number($("#productTotalPrice"+orderId).text())*100,
    orderFreightPrice: Number($("#productFreightPrice"+orderId).text())*100
  }
  var postObj = {
    costId: costId,
    orderId: orderId,
    costObj: costObj,
    orderObj: orderObj
  };
  nkcAPI('/shop/manage/'+sellUid+'/order/editCostRecord', "PATCH", postObj)
  .then(function(data) {
    screenTopAlert("保存成功");
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  })
}