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
  // 选择付款方式 
  var payMethod = $("input[name='payMethod']:checked").val();
  var para = [];
  // 获取帐单中的产品与数量
  $(".order").each(function() {
    var obj = {
      paraId: $(this).attr("paid"),
      productCount: $(this).text()
    }
    para.push(obj)
  })
  nkcAPI('/shop/order', "POST", {post: para, payMethod: payMethod})
  .then(function(data) {
    console.log("提交成功")
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}