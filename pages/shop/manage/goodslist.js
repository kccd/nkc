/**
 * 编辑商品信息
 */
function editProductParamInfo() {

}

/**
 * 立即上架
 */
function shelfRightNow(uid, productId) {
  nkcAPI('/shop/manage/'+uid+'/goodslist/shelfRightNow', "PATCH", {productId:productId})
  .then(function() {
    screenTopAlert("上架成功");
    var targetUrl = '/shop/manage/'+uid+'/goodslist';
    window.location.href = targetUrl;
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}

/**
 * 商品停售
 */
function stopSale(uid,productId) {
  var sureStopSale = confirm("是否确认停售该商品?");
  if(sureStopSale){
    nkcAPI('/shop/manage/'+uid+'/goodslist/productStopSale', "PATCH", {productId: productId})
    .then(function(data) {
      screenTopAlert("商品已停售");
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data.error || data)
    })
  }
}

/**
 * 商品复售
 */
function goonSale(uid,productId) {
  var sureGoonSale = confirm("是否确认复售该商品?");
  if(sureGoonSale) {
    nkcAPI('/shop/manage/'+uid+'/goodslist/productGoonSale', "PATCH", {productId: productId})
    .then(function(data) {
      screenTopAlert("商品已复售");
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data.error || data)
    })
  }
}

/**
 * 修改商品规格
 */
function editParam(paraId) {
  $("#save"+paraId).css("display", "");
  $("#edit"+paraId).css("display", "none");
  $("#originPrice"+paraId).attr("contenteditable", "true")
  $("#paramPrice"+paraId).attr("contenteditable", "true")
  $("#stocksSurplus"+paraId).attr("contenteditable", "true")
  $("#originPrice"+paraId).focus()
}

/**
 * 提交修改规格信息
 */
function paramToEdit(uid,paraId) {
  // 获取要修改的规格信息
  var originPrice = Number($("#originPrice"+paraId).text());
  var paramPrice = Number($("#paramPrice"+paraId).text());
  var stocksSurplus = Number($("#stocksSurplus"+paraId).text());
  // var stocksSurplus = Number($("#stocksSurplus"+paraId).text());
  if(originPrice <= 0 || paramPrice <= 0 || stocksSurplus <= 0){
    return screenTopWarning("数值必须为正数")
  }
  if(isNaN(originPrice) || isNaN(paramPrice) || isNaN(stocksSurplus)){
    return screenTopWarning("数值必须为正数");
  }
  if(originPrice < paramPrice) {
    return screenTopWarning("原始价格不得小于优惠价");
  }
  // if(stocksTotal < stocksSurplus) {
  //   return screenTopWarning("原始库存不得小于当前库存");
  // }

  var obj = {
    paraId: paraId,
    originPrice: originPrice.toFixed(2)*100,
    price: paramPrice.toFixed(2)*100,
    stocksSurplus: stocksSurplus.toFixed(0)*1
  }
  nkcAPI('/shop/manage/'+uid+'/goodslist/editParam', "PATCH", {obj:obj})
  .then(function(data) {
    screenTopAlert("修改成功");
    $("#save"+paraId).css("display", "none");
    $("#edit"+paraId).css("display", "");
    $("#originPrice"+paraId).attr("contenteditable", "false")
    $("#paramPrice"+paraId).attr("contenteditable", "false")
    $("#stocksSurplus"+paraId).attr("contenteditable", "false")
    // window.location.reload();
  })
  .catch(function(data) {
    screenTopWarning(data || data.error)
  })
}

/**
 * 
 */
function editProductShelf(uid, productId) {
  var stockCostMethod = $("input[name='stockCostMethod']:checked").val(); // 商品减库存方式
  // 是否使用限购
  var isPurchaseLimit = $("#isPurchaseLimit").prop("checked");
  var purchaseLimitCount;
  if(isPurchaseLimit) {
    purchaseLimitCount = $("#purchaseLimitCount").val();
    purchaseLimitCount = Number(purchaseLimitCount);
    if(!purchaseLimitCount || isNaN(purchaseLimitCount) || purchaseLimitCount < 0){
      throw("限购数量应该是正整数且不大于商品的库存数量");
    }
  }else{
    purchaseLimitCount = -1;
  }
  // 是否需要上传购买凭证
  var isUploadCert = $("#isUploadCert").prop("checked");
  var uploadCertDescription;
  var uploadCert = false;
  if(isUploadCert){
    uploadCert = true;
    uploadCertDescription = $("#uploadCertDescription").val();
  }
  // 获取物流价格
  var isFreePost = true; // 是否免邮
  var freightPrice = {
    firstFreightPrice: null,
    addFreightPrice: null
  }; // 运费模板
  var freightMethod = $("input[name='freightMethod']:checked").val();
  var firstFreightPrice = Number($("#firstFreightPrice").val())*100;
  var addFreightPrice = Number($("#addFreightPrice").val())*100;
  if(freightMethod !== "freePost") {
    isFreePost = false;
    if(isNaN(firstFreightPrice) || firstFreightPrice <= 0 || isNaN(addFreightPrice) || addFreightPrice < 0) {
      throw("请正确设置运费模板");
    }
    freightPrice.firstFreightPrice = firstFreightPrice;
    freightPrice.addFreightPrice = addFreightPrice;
  }
  // 组装修改数据
  var post = {
    stockCostMethod: stockCostMethod,
    purchaseLimitCount:purchaseLimitCount,
    uploadCert: uploadCert,
    uploadCertDescription: uploadCertDescription,
    isFreePost: isFreePost,
    freightPrice: freightPrice,
    productId:productId
  }
  nkcAPI('/shop/manage/'+uid+'/goodslist/editProduct', "PATCH", post)
  .then(function(data) {
    screenTopAlert("修改成功");
  })
  .catch(function(data) {
    screenTopWarning(data.error || data)
  })
}