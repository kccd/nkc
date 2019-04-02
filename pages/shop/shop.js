var totalPrice;
$(document).ready(function() {
  var freightPrice = $("#freightPrice").text();
  freightPrice = Number(freightPrice);
  $("#buyCount").bind("input propertychange", function() {
    var productCount = $(this).val();
    // 获取单件产品运费
    // 产品数量改变，改变运费显示
    productCount = Number(productCount);
    if(isNaN(productCount) || productCount < 0) {
      totalPrice = freightPrice;
    }else{
      totalPrice = freightPrice * productCount;
    }
    $("#freightPrice").text(totalPrice);
  })
})
/* 
  添加商品到购物车
  @param id: 商品规格ID
  @param count: 添加到购物车的商品数量
  @author pengxiguaa 2019/3/4
*/
function addToCart(id, count) {
  kcAPI('/shop/cart', 'POST', {productParamId: id, count: count})
    .then(function(data) {
      if(!data.user){
        window.location.href="/login";
      }else{
        screenTopAlert('添加成功');
      }
    })
    .catch(function(err) {
      screenTopWarning(err);
    });
}

/**
 * 选择商品规格
 */
function choiceProductParams(para,productId) {
  // 先判断是否含有class
  var isActive = $(para).hasClass("activeIndex");
  if(isActive){
    return; 
  }else{
    // 先使用消除其他class
    $(".activeIndex").addClass("normalIndex");
    $(".activeIndex").removeClass("activeIndex");
    // 再给自己添加class
    $(para).removeClass("normalIndex")
    $(para).addClass("activeIndex");
  }
  // 获取当前的paraId
  var paraId = $(para).attr("paraId")
  nkcAPI("/shop/product/"+productId+"/changePara" ,"PATCH", {paraId: paraId})
  .then(function (data) {
    var productParams = data.productParams;
    $("#originPrice").text(numToFloatTwo(productParams.originPrice));
    $("#newPrice").text(numToFloatTwo(productParams.price))
    $("#stockCount").text(productParams.stocksSurplus);
    $("#paraId").text(productParams._id)
  })
  .catch(function(data) {
    screenTopWarning(data || data.error)
  })
  // var currentUrl = window.location.pathname;
  // window.location.href = currentUrl+"?paraId="+paraId
}


/**
 * 商品添加到购物车
 */
function addProductToCart() {
  var productCount = $("#buyCount").val();
  productCount = Number(productCount)
  if(isNaN(productCount) || productCount <0) return screenTopWarning("商品数量不得小于0");
  // 检查库存
  var stockCount = $("#stockCount").text();
  stockCount = Number(stockCount);
  if(productCount > stockCount) {
    return screenTopWarning("库存不足");
  }
  // 获取规格
  var paraId = $("#paraId").text();
  addToCart(paraId, parseInt(productCount));
}

/**
 * 生成账单
 * 直接购买
 */
function submitProductToBill() {

  // 获取商品数量
  var productCount = $("#buyCount").val();
  productCount = Number(productCount);
  if(isNaN(productCount) || productCount < 1) {
    return screenTopWarning("商品数量输入有误，请检查");
  }
  // 检查库存
  var stockCount = $("#stockCount").text();
  stockCount = Number(stockCount);
  if(productCount > stockCount) {
    return screenTopWarning("库存不足");
  }
  // 获取规格
  var paraId = $("#paraId").text();
  window.location.href = "/shop/bill?paraId="+paraId+"&productCount="+productCount
}

/**
 * 增加购买数量
 */
function addStock() {
  var stockCount = $("#stockCount").text();
  stockCount = Number(stockCount);
  var buyCount = $("#buyCount").val();
  buyCount = Number(buyCount);
  if(buyCount < 1 || isNaN(buyCount)) {
    buyCount = 1
  }
  buyCount += 1;
  if(buyCount > stockCount) {
    screenTopWarning("数量不得大于库存")
    buyCount = stockCount;
  }
  $("#buyCount").val(buyCount);
}

/**
 * 减少购买数量
 */
function delStock() {
  var stockCount = $("#stockCount").text();
  stockCount = Number(stockCount);
  var buyCount = $("#buyCount").val();
  buyCount = Number(buyCount);
  if(isNaN(buyCount)) {
    buyCount = 1;
  }
  buyCount -= 1;
  if(buyCount < 1) {
    screenTopWarning("至少购买一件")
    buyCount =1 
  }
  $("#buyCount").val(buyCount);
}


/**
 * 价格显示为保留两位小数
 * @param {*} str 
 */
function numToFloatTwo(str) {
	str = (str/100).toFixed(2);
	return str;
} 