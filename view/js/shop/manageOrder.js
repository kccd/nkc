const CommonModal = new NKC.modules.CommonModal();
const Ship = new NKC.modules.ShopShip();
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
function getNumber(str, fractionDigits = 0) {
  str = str + "";
  str = str.replace("￥", "");
  str = parseFloat(str);
  str = str.toFixed(fractionDigits);
  return parseFloat(str);
}
// 重新计算订单总价
function computeOrderPrice(orderId) {
  const orderDom = $(`tr[data-order-id='${orderId}']`);
  const paramPriceDom = orderDom.find(".data-param-price");
  const countDom = orderDom.find(".data-param-count");
  const freightDom = orderDom.find(".data-params-freight");
  const prices = [];
  const counts = [];
  for(let i = 0; i < paramPriceDom.length; i++) {
    const dom = paramPriceDom.eq(i);
    prices.push(getNumber(dom.text(), 2));
  }
  console.log(prices);
  for(let i = 0; i < countDom.length; i++) {
    const dom = countDom.eq(i);
    counts.push(getNumber(dom.text(), 0));
  }
  if(prices.length !== counts.length) return sweetError("订单页面错误，请刷新页面");
  let totalPrice = 0;
  for(let i = 0; i < prices.length; i++) {
    totalPrice += prices[i] * counts[i];
  }
  const freight = getNumber(freightDom.text(), 2);
  orderDom.find(`.data-params-price`).text(`￥${totalPrice.toFixed(2)}`);
  orderDom.find(`.data-order-price`).text(`￥${(totalPrice + freight).toFixed(2)}`);
  return {
    paramsPrice: totalPrice,
    freightPrice: freight,
    orderPrice: totalPrice + freight
  }
}


// 修改商品单价
function modifyParamPrice(sellUid, orderId, costId) {
  const priceDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-price`);
  const countDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-count`);
  const freightDom = $(`tr[data-order-id='${orderId}'] .data-params-freight`);
  const freightPrice = getNumber(freightDom.text(), 2);
  const price = getNumber(priceDom.text(), 2);
  const count = getNumber(countDom.text(), 0);
  CommonModal.open((data) => {
    const newPrice = getNumber(data[0].value, 2);
    nkcAPI(`/shop/manage/${sellUid}/order/editCostRecord`, "PATCH", {
      type: "modifyParam",
      costId,
      orderId,
      freightPrice: freightPrice * 100,
      costObj: {
        singlePrice: newPrice * 100,
        count
      }
    })
      .then(() => {
        priceDom.text(`￥${newPrice.toFixed(2)}`);
        computeOrderPrice(orderId);
        CommonModal.close();
      })
      .catch(sweetError);
  }, {
    title: "修改单价",
    data: [
      {
        dom: "input",
        label: "单位元，精确到小数点后两位",
        value: price
      }
    ]
  });
}

// 修改商品数量
function modifyParamCount(sellUid, orderId, costId) {
  const countDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-count`);
  const priceDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-price`);
  const freightDom = $(`tr[data-order-id='${orderId}'] .data-params-freight`);
  const freightPrice = getNumber(freightDom.text(), 2);
  const price = getNumber(priceDom.text(), 2);
  const count = getNumber(countDom.text(), 0);
  CommonModal.open((data) => {
    const newCount = getNumber(data[0].value, 2);
    nkcAPI(`/shop/manage/${sellUid}/order/editCostRecord`, "PATCH", {
      type: "modifyParam",
      costId,
      orderId,
      freightPrice: freightPrice * 100,
      costObj: {
        singlePrice: price * 100,
        count: newCount
      }
    })
      .then(() => {
        countDom.text(`${newCount}`);
        computeOrderPrice(orderId);
        CommonModal.close();
      })
      .catch(sweetError);
  }, {
    title: "修改数量",
    data: [
      {
        dom: "input",
        value: count
      }
    ]
  });
}

// 修改运费
function modifyFreight(sellUid, orderId) {
  const freightDom = $(`tr[data-order-id='${orderId}'] .data-params-freight`);
  const freightPrice = getNumber(freightDom.text(), 2);
  CommonModal.open((data) => {
    const newFreightPrice = getNumber(data[0].value, 2);
    nkcAPI(`/shop/manage/${sellUid}/order/editCostRecord`, "PATCH", {
      type: "modifyFreight",
      orderId,
      freightPrice: newFreightPrice * 100,
    })
      .then(() => {
        freightDom.text(`￥${newFreightPrice.toFixed(2)}`);
        computeOrderPrice(orderId);
        CommonModal.close();
      })
      .catch(sweetError);
  }, {
    title: "修改运费",
    data: [
      {
        dom: "input",
        value: freightPrice
      }
    ]
  });
}
// 发货/修改物流信息
function ship(orderId) {
  Ship.open(() => {
  
  }, {
    orderId
  })
}