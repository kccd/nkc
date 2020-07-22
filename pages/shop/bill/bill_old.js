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
  if(!receiveAddress) return sweetWarning("请选择收货地址")
  if(!receiveName) return sweetWarning("收件人不得为空，请完善信息后提交订单");
  if(!receiveMobile) return sweetWarning("联系方式不得为空, 请完善信息后提交订单");
  var receInfo = {
    receiveAddress: receiveAddress,
    receiveName: receiveName,
    receiveMobile: receiveMobile
  };
  var para = [];
  // 检查购买限制
  if($(".limitBuy").length > 0){
    return sweetWarning("有商品存在购买限制，请重新下单")
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
        sweetWarning("请上传凭证");
        throw "请上传凭证"
      }
    }
  })
  var tempArr = [];
  // 获取账单中全部商品的快递方式
  $(".tempArr").each(function() {
    var cartId = $(this).find("option:selected").attr("cartid");
    var option = {
      cartId: cartId,
      freight: Number($("#freightSingle"+cartId).text())*100
    }
    tempArr.push(option)
  })
  $("#submitPay").attr('disabled',true);
  nkcAPI('/shop/order', "POST", {post: data, receInfo: receInfo, paramCert: paramCert, tempArr: tempArr})
  .then(function(data) {
    // window.location.href = '/shop/pay?ordersId=' + data.ordersId;
    openToNewLocation('/shop/pay?ordersId=' + data.ordersId);
  })
  .catch(function(data) {
    sweetWarning(data || data.error)
    // sweetWarning(data || data.error);
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
      sweetWarning(data);
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
  nkcAPI("/shop/bill/add", "PUT", post)
  .then(function(data) {
    $(para).removeAttr("disabled");
    $(para).next().text(count+"");
    // 获取商品差值
    var singlePricesPlus = data.singlePrices - Number($(para).parents("tr").find("#singlePrices").text())*100;
    $(para).parents("tr").find("#singlePrices").text(numToFloatTwo(data.singlePrices));

    // 当前商品新总价
    var singlePrices = data.singlePrices;
    // 重新计算当前商品总邮费
    // 1.获取当前邮费规则
    var isFreePost = $("#isFreePost"+cartId).attr("isFreePost");
    var freightAddPrice = 0;
    var freightFirstPrice = 0;
    if(isFreePost && isFreePost==="false") {
      freightFirstPrice = Number($("#tempArr"+cartId).find("option:selected").attr("dataffp"));
      freightAddPrice = Number($("#tempArr"+cartId).find("option:selected").attr("dataafp"));
    }
    // 2.计算邮费
    var currentSingleFreight = freightFirstPrice + (freightAddPrice*(count-1));
    // 3.获取邮费差值
    var currentSingleFreightPlus = currentSingleFreight - Number($("#freightSingle"+cartId).text())*100;
    // 4.显示结果
    $("#freightSingle"+cartId).text(numToNumberTwo(currentSingleFreight));

    // 计算总差值
    var totalPricePlus = singlePricesPlus + currentSingleFreightPlus;
    // console.log();
    //根据总差值， 修改商品总计和全订单总计
    $("#billTotalPrice"+data.sellUid).text(numToNumberTwo(totalPricePlus + Number($("#billTotalPrice"+data.sellUid).text())*100));
    $("#totalPrice").text(numToNumberTwo(totalPricePlus + Number($("#totalPrice").text())*100));
  })
  .catch(function(data) {
    $(para).removeAttr("disabled");
    return sweetWarning(data.error || data)
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
    return sweetWarning("至少购买一件商品");
  }
  var productParamId = $(para).attr("productParamId");
  var cartId = $(para).attr("cartId");
  var post = {
    productParamId: productParamId,
    cartId: cartId,
    count: count
  }
  nkcAPI("/shop/bill/plus", "PUT", post)
  .then(function(data) {
    $(para).removeAttr("disabled");
    $(para).prev().text(count+"");
    // 获取商品差值
    var singlePricesPlus = data.singlePrices - Number($(para).parents("tr").find("#singlePrices").text())*100;
    $(para).parents("tr").find("#singlePrices").text(numToFloatTwo(data.singlePrices));

    // 当前商品新总价
    var singlePrices = data.singlePrices;
    // 重新计算当前商品总邮费
    // 1.获取当前邮费规则
    var isFreePost = $("#isFreePost"+cartId).attr("isFreePost");
    var freightAddPrice = 0;
    var freightFirstPrice = 0;
    if(isFreePost && isFreePost === "false") {
      freightFirstPrice = Number($("#tempArr"+cartId).find("option:selected").attr("dataffp"));
      freightAddPrice = Number($("#tempArr"+cartId).find("option:selected").attr("dataafp"));
    }
    // 2.计算邮费
    var currentSingleFreight = freightFirstPrice + (freightAddPrice*(count-1));
    // 3.获取邮费差值
    var currentSingleFreightPlus = currentSingleFreight - Number($("#freightSingle"+cartId).text())*100;
    // 4.显示结果
    $("#freightSingle"+cartId).text(numToNumberTwo(currentSingleFreight));

    // 计算总差值
    var totalPricePlus = singlePricesPlus + currentSingleFreightPlus;
    // console.log();
    //根据总差值， 修改商品总计和全订单总计
    $("#billTotalPrice"+data.sellUid).text(numToNumberTwo(totalPricePlus + Number($("#billTotalPrice"+data.sellUid).text())*100));
    $("#totalPrice").text(numToNumberTwo(totalPricePlus + Number($("#totalPrice").text())*100));
  })
  .catch(function(data) {
    $(para).removeAttr("disabled");
    return sweetWarning(data.error || data);
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

/**
 * 修改运送方式，并修改当前小项价格
 */
function changeFreightTemplate(para) {
  // 获取被修改的cart所在billID
  var billId = $(para).attr("datauid");
  // 获取被修改的cartId
  const cartId = $(para).attr("dataid");
  // 获取当前选中的模板id
  var freightId = $(para).val();
  // 获取新模板的首价格与后续价格
  var newFirstPrice = Number($(para).find("option:selected").attr("dataffp"));
  var newAddPrice = Number($(para).find("option:selected").attr("dataafp"));
  // 获取当前cart运费总价
  var currentSingleFreight = Number($("#freightSingle"+cartId).text())*100;
  // 获取当前商品数量
  var cartCount = $("#cartCount"+cartId).text();

  // 计算新的当前cart运费
  var newCartFreightPrice = newFirstPrice + (newAddPrice * (cartCount - 1));
  // 计算与当前cart运费的差值
  var freightSinglePlus = newCartFreightPrice - currentSingleFreight;

  // 将计算好的数值放到cart，小计，总计中
  $("#freightSingle"+cartId).text(numToNumberTwo(newCartFreightPrice));
  $("#billTotalPrice"+billId).text(numToNumberTwo(freightSinglePlus + Number($("#billTotalPrice"+billId).text())*100));
  $("#totalPrice").text(numToNumberTwo(freightSinglePlus + Number($("#totalPrice").text())*100));
}
