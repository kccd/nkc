/**
 * 添加精选商品
 */
function addFeatured() {
  var productId = $("#carouselLink").val();
  productId = productId.trim();
  if(!productId) return screenTopWarning("请输入商品Id");
  nkcAPI('/e/settings/shop/homeSetting/featured', "POST", {type:"add",productId:productId})
  .then(function(data) {
    screenTopAlert("添加成功");
    $('#myModal').modal('hide');
    location.href = "/e/settings/shop/homeSetting/featured";
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}

/**
 * 取消精选商品
 */
function delFeatured(productId) {
  nkcAPI("/e/settings/shop/homeSetting/featured", "POST", {type:"del", productId: productId})
  .then(function(data) {
    screenTopAlert("已取消该商品精选");
    location.href = "/e/settings/shop/homeSetting/featured";
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}

function test(para) {
  console.log(para)
}