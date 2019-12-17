"use strict";

var CommonModal = new NKC.modules.CommonModal();
var Ship = new NKC.modules.ShopShip();
var ModifyPrice = new NKC.modules.ShopModifyPrice(); // 修改卖家备注

function modifySellMessage(uid, orderId) {
  var dom = $("tr[data-order-id='".concat(orderId, "'] .data-sell-message"));
  CommonModal.open(function (data) {
    var value = data[0].value;
    nkcAPI('/shop/manage/' + uid + '/order/editSellMessage', "PATCH", {
      sellMessage: value,
      orderId: orderId
    }).then(function () {
      dom.text(value);
      CommonModal.close();
      sweetSuccess("保存成功");
    })["catch"](sweetWarning);
  }, {
    title: "修改备注",
    data: [{
      value: dom.text(),
      dom: "textarea"
    }]
  });
} // 获取金额 转换成数字且去掉￥


function getNumber(str) {
  var fractionDigits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  str = str + "";
  str = str.replace("￥", "");
  str = parseFloat(str);
  str = str.toFixed(fractionDigits);
  return parseFloat(str);
} // 重新计算订单总价


function computeOrderPrice(orderId) {
  var orderDom = $("tr[data-order-id='".concat(orderId, "']"));
  var paramPriceDom = orderDom.find(".data-param-price");
  var countDom = orderDom.find(".data-param-count");
  var freightDom = orderDom.find(".data-params-freight");
  var prices = [];
  var counts = [];

  for (var i = 0; i < paramPriceDom.length; i++) {
    var dom = paramPriceDom.eq(i);
    prices.push(getNumber(dom.text(), 2));
  }

  for (var _i = 0; _i < countDom.length; _i++) {
    var _dom = countDom.eq(_i);

    counts.push(getNumber(_dom.text(), 0));
  }

  if (prices.length !== counts.length) return sweetError("订单页面错误，请刷新页面");
  var totalPrice = 0;

  for (var _i2 = 0; _i2 < prices.length; _i2++) {
    totalPrice += prices[_i2] * counts[_i2];
  }

  var freight = getNumber(freightDom.text(), 2);
  orderDom.find(".data-params-price").text("\uFFE5".concat(totalPrice.toFixed(2)));
  orderDom.find(".data-order-price").text("\uFFE5".concat((totalPrice + freight).toFixed(2)));
  return {
    paramsPrice: totalPrice,
    freightPrice: freight,
    orderPrice: totalPrice + freight
  };
} // 修改商品单价


function modifyParamPrice(sellUid, orderId, costId) {
  var priceDom = $("tr[data-order-id='".concat(orderId, "'][data-order-param-id='").concat(costId, "'] .data-param-price"));
  var countDom = $("tr[data-order-id='".concat(orderId, "'][data-order-param-id='").concat(costId, "'] .data-param-count"));
  var freightDom = $("tr[data-order-id='".concat(orderId, "'] .data-params-freight"));
  var freightPrice = getNumber(freightDom.text(), 2);
  var price = getNumber(priceDom.text(), 2);
  var count = getNumber(countDom.text(), 0);
  return ModifyPrice.open(function (data) {
    var newPrice = data;
    var checkNumber = NKC.methods.checkData.checkNumber;
    Promise.resolve().then(function () {
      checkNumber(newPrice, {
        name: "商品单价",
        min: 0.01,
        fractionDigits: 2
      });
      return nkcAPI("/shop/manage/".concat(sellUid, "/order/editCostRecord"), "PATCH", {
        type: "modifyParam",
        costId: costId,
        orderId: orderId,
        freightPrice: freightPrice * 100,
        costObj: {
          singlePrice: newPrice * 100,
          count: count
        }
      });
    }).then(function () {
      priceDom.text("\uFFE5".concat(newPrice.toFixed(2)));
      computeOrderPrice(orderId);
      CommonModal.close();
    })["catch"](sweetError);
  }, price);
} // 修改商品数量


function modifyParamCount(sellUid, orderId, costId) {
  var countDom = $("tr[data-order-id='".concat(orderId, "'][data-order-param-id='").concat(costId, "'] .data-param-count"));
  var priceDom = $("tr[data-order-id='".concat(orderId, "'][data-order-param-id='").concat(costId, "'] .data-param-price"));
  var freightDom = $("tr[data-order-id='".concat(orderId, "'] .data-params-freight"));
  var freightPrice = getNumber(freightDom.text(), 2);
  var price = getNumber(priceDom.text(), 2);
  var count = getNumber(countDom.text(), 0);
  CommonModal.open(function (data) {
    var newCount = getNumber(data[0].value, 2);
    Promise.resolve().then(function () {
      NKC.methods.checkData.checkNumber(newCount, {
        name: "商品数量",
        min: 1
      });
      return nkcAPI("/shop/manage/".concat(sellUid, "/order/editCostRecord"), "PATCH", {
        type: "modifyParam",
        costId: costId,
        orderId: orderId,
        freightPrice: freightPrice * 100,
        costObj: {
          singlePrice: price * 100,
          count: newCount
        }
      });
    }).then(function () {
      countDom.text("".concat(newCount));
      computeOrderPrice(orderId);
      CommonModal.close();
    })["catch"](sweetError);
  }, {
    title: "修改数量",
    data: [{
      dom: "input",
      value: count
    }]
  });
} // 修改运费


function modifyFreight(sellUid, orderId) {
  var freightDom = $("tr[data-order-id='".concat(orderId, "'] .data-params-freight"));
  var freightPrice = getNumber(freightDom.text(), 2);
  return ModifyPrice.open(function (data) {
    var newFreightPrice = data;
    Promise.resolve().then(function () {
      NKC.methods.checkData.checkNumber(newFreightPrice, {
        name: "运费",
        min: 0,
        fractionDigits: 2
      });
      return nkcAPI("/shop/manage/".concat(sellUid, "/order/editCostRecord"), "PATCH", {
        type: "modifyFreight",
        orderId: orderId,
        freightPrice: newFreightPrice * 100
      });
    }).then(function () {
      freightDom.text("\uFFE5".concat(newFreightPrice.toFixed(2)));
      computeOrderPrice(orderId);
      CommonModal.close();
    })["catch"](sweetError);
  }, freightPrice);
} // 发货/修改物流信息


function ship(orderId) {
  Ship.open(function () {}, {
    orderId: orderId
  });
}