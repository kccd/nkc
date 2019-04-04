/**
 * 编辑商品信息
 */
function editProductParamInfo() {

}

/**
 * 立即上架
 */
function shelfRightNow(storeId, productId) {
  nkcAPI(`/shop/manage/${storeId}/goodslist/shelfRightNow`, "PATCH", {productId})
  .then(function() {
    screenTopAlert("上架成功");
    var targetUrl = `/shop/manage/${storeId}/goodslist`;
    window.location.href = targetUrl;
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}

/**
 * 提交修改规格信息
 */
function paramToEdit(storeId,paraId) {
  // 获取要修改的规格信息
  var originPrice = Number($("#originPrice").val());
  var price = Number($("#price").val());
  var stocksTotal = Number($("#stocksTotal").val());
  if(originPrice <= 0 || price <= 0 || stocksTotal <= 0){
    return screenTopWarning("数值必须为正数")
  }
  if(isNaN(originPrice) || isNaN(price) || isNaN(stocksTotal)){
    return screenTopWarning("数值必须为正数");
  }
  if(originPrice < price) {
    return screenTopWarning("原始价格不得小于优惠价");
  }

  var obj = {
    paraId: paraId,
    originPrice: originPrice.toFixed(2)*100,
    price: price.toFixed(2)*100,
    stocksTotal: stocksTotal.toFixed(0)*1
  }
  nkcAPI(`/shop/manage/${storeId}/goodslist/editParam`, "PATCH", {obj})
  .then(function(data) {
    screenTopAlert("修改成功")
  })
  .catch(function(data) {
    screenTopWarning(data || data.error)
  })
}