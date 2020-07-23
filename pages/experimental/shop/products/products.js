/**
 * 商品解禁
 */
function clearBanSale(productId) {
  var clearBan = confirm("是否接触该商品禁售状态");
  if(clearBan) {
    nkcAPI("/e/settings/shop/products/clearban", "PUT", {productId: productId})
    .then(function(data) {
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data || data.error)
    })
  }
}
