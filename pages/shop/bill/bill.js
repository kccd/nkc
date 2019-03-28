var receiveAddress, receiveName, receiveMobile;

$(document).ready(function() {
  $('input[type=radio][name=address]').change(function() {
    $(".addressSelected").removeClass("addressSelected");
    $(this).parents(".addressBox").addClass("addressSelected");
    // 获取收货信息
    $("#finalAddress").text($(this).next().find(".address").text());
    $("#finalName").text($(this).next().find(".username").text());
    $("#finalMobile").text($(this).next().find(".mobile").text());
  });

  $('input[type=radio][name=payMethod]').change(function() {
    $(".paySelected").removeClass("paySelected");
    $(this).parents(".addressBox").addClass("paySelected");
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
  // 获取付款方式 
  //var payMethod = $("input[name='payMethod']:checked").val();
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
  // 获取帐单中的产品与数量
  $(".order").each(function() {
    var obj = {
      paraId: $(this).attr("paid"),
      productCount: $(this).text()
    }
    para.push(obj)
  })
  $("#submitPay").attr('disabled',true);
  nkcAPI('/shop/order', "POST", {post: para, receInfo: receInfo})
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