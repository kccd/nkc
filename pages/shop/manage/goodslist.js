/**
 * 编辑商品信息
 */
function editProductParamInfo() {

}

/**
 * 立即上架
 */
function shelfRightNow(uid, productId) {
  nkcAPI('/shop/manage/'+uid+'/goodslist/shelfRightNow', "PUT", {productId:productId})
  .then(function() {
    sweetAlert("上架成功");
    var targetUrl = '/shop/manage/'+uid+'/goodslist';
    // window.location.href = targetUrl;
    openToNewLocation(targetUrl)
  })
  .catch(function(data) {
    sweetWarning(data || data.error);
  })
}

/**
 * 商品停售
 */
function stopSale(uid,productId) {
  var sureStopSale = confirm("是否确认停售该商品?");
  if(sureStopSale){
    nkcAPI('/shop/manage/'+uid+'/goodslist/productStopSale', "PUT", {productId: productId})
    .then(function(data) {
      sweetAlert("商品已停售");
      window.location.reload();
    })
    .catch(function(data) {
      sweetWarning(data.error || data)
    })
  }
}

/**
 * 商品复售
 */
function goonSale(uid,productId) {
  var sureGoonSale = confirm("是否确认复售该商品?");
  if(sureGoonSale) {
    nkcAPI('/shop/manage/'+uid+'/goodslist/productGoonSale', "PUT", {productId: productId})
    .then(function(data) {
      sweetAlert("商品已复售");
      window.location.reload();
    })
    .catch(function(data) {
      sweetWarning(data.error || data)
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
    return sweetWarning("数值必须为正数")
  }
  if(isNaN(originPrice) || isNaN(paramPrice) || isNaN(stocksSurplus)){
    return sweetWarning("数值必须为正数");
  }
  if(originPrice < paramPrice) {
    return sweetWarning("原始价格不得小于优惠价");
  }
  // if(stocksTotal < stocksSurplus) {
  //   return sweetWarning("原始库存不得小于当前库存");
  // }

  var obj = {
    paraId: paraId,
    originPrice: originPrice.toFixed(2)*100,
    price: paramPrice.toFixed(2)*100,
    stocksSurplus: stocksSurplus.toFixed(0)*1
  }
  nkcAPI('/shop/manage/'+uid+'/goodslist/editParam', "PUT", {obj:obj})
  .then(function(data) {
    sweetAlert("修改成功");
    $("#save"+paraId).css("display", "none");
    $("#edit"+paraId).css("display", "");
    $("#originPrice"+paraId).attr("contenteditable", "false")
    $("#paramPrice"+paraId).attr("contenteditable", "false")
    $("#stocksSurplus"+paraId).attr("contenteditable", "false")
    // window.location.reload();
  })
  .catch(function(data) {
    sweetWarning(data || data.error)
  })
}

Object.assign(window, {
  editProductParamInfo,
  shelfRightNow,
  stopSale,
  goonSale,
  editParam,
  paramToEdit,
});
