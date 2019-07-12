var receiveAddress, receiveName, receiveMobile;
var paramCert = {} // 要求上传凭证的产品
$(document).ready(function() {
  $('input[type=radio][name=address]').change(function() {
    $(".addressSelected").removeClass("addressSelected");
    $(this).parents(".addressBox").addClass("addressSelected");
    // 获取收货信息
    $("#finalAddress").text($(this).next().find(".address").text());
    $("#finalName").text($(this).next().find(".username").text());
    $("#finalMobile").text($(this).next().find(".mobile").text());
  });
})

/**
 * 提交订单并付款
 * @para:[
 *  {
 *    paraId: 规格id
 *    productCount: 商品数量
 *  }
 * ]
 */
function submitOrders() {
  // 获取配送地址
  var receiveDom = $("input[name='address']:checked");
  receiveAddress = receiveDom.next().find(".address").text();
  receiveName = receiveDom.next().find(".username").text();
  receiveMobile = receiveDom.next().find(".mobile").text();
  if(!receiveAddress) return screenTopWarning("请选择收货地址")
  if(!receiveName) return screenTopWarning("收件人不得为空，请完善信息后提交订单");
  if(!receiveMobile) return screenTopWarning("联系方式不得为空, 请完善信息后提交订单");
  var receInfo = {
    receiveAddress: receiveAddress,
    receiveName: receiveName,
    receiveMobile: receiveMobile
  };
  var para = [];
  // 检查购买限制
  if($(".limitBuy").length > 0){
    return screenTopWarning("有商品存在购买限制，请重新下单")
  }
  // 获取账单信息
  var data = document.getElementById('data');
  data = JSON.parse(data.innerHTML);
  for(var i in data) {
    // 获取卖家留言
    var message = $("#message"+data[i].user.uid).val();
    data[i].message = message;
  }
  // 获取帐单中的产品与数量
  $(".order").each(function() {
    var needUploadCert = $(this).attr("data-upload-cert");
    var paraId = $(this).attr("paid");
    if(needUploadCert === "true") {
      if(!paramCert[paraId]) {
        screenTopWarning("请上传凭证");
        throw "请上传凭证"
      }
    }
  })
  $("#submitPay").attr('disabled',true);
  nkcAPI('/shop/order', "POST", {post: data, receInfo: receInfo, paramCert: paramCert})
  .then(function(data) {
    // window.location.href = '/shop/pay?ordersId=' + data.ordersId;
    openToNewLocation('/shop/pay?ordersId=' + data.ordersId);
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
    $("#submitPay").attr('disabled',false);
  })
}

/**
 * 新增收货地址
 */
function addAddress() {

}

/**
 * 切换收货地址
 */


function uploadCert(id) {
  var input = $("#input_" + id);
  input.click();
}
function inputChange(a) {
  var paramId = a.getAttribute("data-param-id");
  var file = a.files[0];
  var formData = new FormData();
  formData.append("type", "shopping");
  formData.append("file", file);
  uploadFilePromise("/shop/cert", formData, function(d) {
    console.log(d);
  })
    .then(function(data) {
      screenTopAlert("上传成功");
      paramCert[paramId] = data.cert._id;
      $(".cert-" + paramId + " button").removeClass("hidden");
    })
    .catch(function(data) {
      screenTopWarning(data);
    });
}
function viewCert(id) {
  window.open("/shop/cert/" + paramCert[id]);
}

/**
 * 商品数量加一
 */
function countAddOne(para) {
  $(para).attr("disabled","true");
  var count = parseInt($(para).next().text());
  count++;
  // 获取当前商品总数量,并修改购物车中的商品数量，并检测商品数量是否超过总数量
  var productParamId = $(para).attr("productParamId");
  var cartId = $(para).attr("cartId");
  var post = {
    productParamId: productParamId,
    cartId: cartId,
    count: count
  }
  nkcAPI("/shop/bill/add", "PATCH", post)
  .then(function(data) {
    $(para).removeAttr("disabled");
    $(para).next().text(count+"");
    $(para).parents("tr").find("#singlePrices").text(numToFloatTwo(data.singlePrices));
    var freightTrId = '#freight' + data.sellUid;
    $(para).parents("tbody").find(freightTrId).find("#freightPrices").text(numToFloatTwo(data.freightPrices));

    // 店铺商品合计(包含邮费)
    var productPrices = 0;
    $(para).parents("tbody").find(".param"+data.sellUid).each(function(){
      productPrices = productPrices + ($(this).find("#singlePrices").text()*100);
    })
    productPrices = productPrices + ($("#freight"+data.sellUid).find("#freightPrices").text() * 100);
    $("#heji"+data.sellUid).find(".hejiPrices").text(numToFloatTwo(productPrices))

    // 计算账单总计
    var productTotalPrices = 0;
    $(para).parents("tbody").find(".hejiPrices").each(function() {
      productTotalPrices = productTotalPrices + ($(this).text() *100)
    })
    $("#totalPrice").text(numToFloatTwo(productTotalPrices))

  })
  .catch(function(data) {
    $(para).removeAttr("disabled");
    return screenTopWarning(data || data.error)
  })
}

/**
 * 商品数量减一
 */
function countPlusOne(para) {
  $(para).attr("disabled","true");
  var count = parseInt($(para).prev().text());
  count--;
  if(count < 1) {
    $(para).removeAttr("disabled");
    return screenTopWarning("至少购买一件商品");
  }
  var productParamId = $(para).attr("productParamId");
  var cartId = $(para).attr("cartId");
  var post = {
    productParamId: productParamId,
    cartId: cartId,
    count: count
  }
  nkcAPI("/shop/bill/plus", "PATCH", post)
  .then(function(data) {
    $(para).removeAttr("disabled");
    $(para).prev().text(count+"");
    $(para).parents("tr").find("#singlePrices").text(numToFloatTwo(data.singlePrices));
    var freightTrId = '#freight' + data.sellUid;
    $(para).parents("tbody").find(freightTrId).find("#freightPrices").text(numToFloatTwo(data.freightPrices));

    // 店铺商品合计(包含邮费)
    var productPrices = 0;
    $(para).parents("tbody").find(".param"+data.sellUid).each(function(){
      productPrices = productPrices + ($(this).find("#singlePrices").text()*100);
    })
    productPrices = productPrices + ($("#freight"+data.sellUid).find("#freightPrices").text() * 100);
    $("#heji"+data.sellUid).find(".hejiPrices").text(numToFloatTwo(productPrices))

    // 计算账单总计
    var productTotalPrices = 0;
    $(para).parents("tbody").find(".hejiPrices").each(function() {
      productTotalPrices = productTotalPrices + ($(this).text() *100)
    })
    $("#totalPrice").text(numToFloatTwo(productTotalPrices))
  })
  .catch(function(data) {
    $(para).removeAttr("disabled");
    return screenTopWarning(data || data.error);
  })
}

/**
 * 重新计算商品合计
 */
function reCountSinglePrice(count) {

}

/**
 * 检测当前商品是否限购
 */

function numToFloatTwo(str) {
	str = (str/100).toFixed(2);
	return str;
} 