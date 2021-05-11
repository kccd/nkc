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

/**
 * 添加推荐店铺
 */
function addRecommendation() {
  var storeId = $("#recommendationLink").val();
  storeId = storeId.trim();
  if(!storeId) return screenTopWarning("请输入店铺Id");
  nkcAPI("/e/settings/shop/homeSetting/recommendation", "POST", {type:"add", storeId: storeId})
  .then(function(data) {
    screenTopAlert("推荐成功");
    $('#myModal').modal('hide');
    window.location.reload();
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}


/**
 * 添加热门商品
 */
function addPopular() {
  var productId = $("#popularLink").val();
  productId = productId.trim();
  if(!productId) return screenTopWarning("请输入商品Id");
  nkcAPI('/e/settings/shop/homeSetting/popular', "POST", {type:"add",productId:productId})
  .then(function(data) {
    screenTopAlert("添加成功");
    $('#myModal').modal('hide');
    location.href = "/e/settings/shop/homeSetting/popular";
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}

/**
 * 取消热门商品
 */
function delPopular(productId) {
  nkcAPI("/e/settings/shop/homeSetting/popular", "POST", {type:"del", productId: productId})
  .then(function(data) {
    screenTopAlert("已取消该商品精选");
    location.href = "/e/settings/shop/homeSetting/popular";
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}

Object.assign(window, {
  addFeatured,
  delFeatured,
  test,
  addRecommendation,
  addPopular,
  delPopular,
});