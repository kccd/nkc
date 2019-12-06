const CommonModal = new NKC.modules.CommonModal();

// 修改卖家备注
function modifySellMessage(uid, orderId) {
  const dom = $(`tr[data-order-id='${orderId}'] .data-sell-message`);
  CommonModal.open((data) => {
    const value = data[0].value;
    nkcAPI('/shop/manage/'+uid+'/order/editSellMessage', "PATCH", {sellMessage: value, orderId: orderId})
      .then(function() {
        dom.text(value);
        CommonModal.close();
        sweetSuccess("保存成功");
      })
      .catch(sweetWarning)
  }, {
    title: "修改备注",
    data: [
      {
        value: dom.text(),
        dom: "textarea"
      }
    ]
  })
}
// 获取金额 转换成数字且去掉￥
function getNumber(dom) {
  return parseFloat(dom.text().replace("￥", ""));
}
// 重新计算订单总价
function computeOrderPrice() {
  const paramPriceDoms = $("");
}
// 修改商品单价
function modifyParamPrice(orderId, costId) {
  const priceDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-price`);
  console.log(getNumber(priceDom))
}