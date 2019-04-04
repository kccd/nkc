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
  var receInfo = {
    receiveAddress, 
    receiveName, 
    receiveMobile, 
  }
  var para = [];
  // 检查购买限制
  if($(".limitBuy").length > 0){
    return screenTopWarning("有商品存在购买限制，请重新下单")
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
    var obj = {
      paraId: $(this).attr("paid"),
      productCount: $(this).text()
    }
    para.push(obj)
  })
  $("#submitPay").attr('disabled',true);
  nkcAPI('/shop/order', "POST", {post: para, receInfo: receInfo, paramCert: paramCert})
  .then(function(data) {
    window.location.href = '/shop/pay?ordersId=' + data.ordersId;
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