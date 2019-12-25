"use strict";

var CommonModal = new NKC.modules.CommonModal();

function modifyParam(productId, paramId) {
  var param = getParam(productId, paramId);
  CommonModal.open(function (data) {
    var paramData = {
      name: data[0].value,
      originPrice: data[1].value,
      stocksSurplus: data[2].value,
      price: data[3].value,
      useDiscount: data[4].value,
      isEnable: data[5].value,
      paramId: paramId,
      productId: productId
    };
    nkcAPI("/shop/manage/".concat(NKC.configs.uid, "/goodslist/editParam"), "PATCH", {
      paramData: paramData
    }).then(function () {
      sweetSuccess("修改成功");
      CommonModal.close();
      setParam(productId, paramId, paramData);
    })["catch"](sweetError);
  }, {
    title: "修改规格",
    data: [{
      dom: "input",
      type: "text",
      label: "名称",
      value: param.name
    }, {
      dom: "input",
      type: "number",
      label: "价格（元，精确到0.01）",
      value: param.originPrice
    }, {
      dom: "input",
      type: "number",
      label: "库存",
      value: param.stocksSurplus
    }, {
      dom: "input",
      type: "number",
      label: "优惠价（元，精确到0.01）",
      value: param.price
    }, {
      dom: "radio",
      label: "是否使用优惠价",
      value: param.useDiscount,
      radios: [{
        value: true,
        name: "是"
      }, {
        value: false,
        name: "否"
      }]
    }, {
      dom: "radio",
      label: "是否屏蔽",
      value: param.isEnable,
      radios: [{
        value: false,
        name: "是"
      }, {
        value: true,
        name: "否"
      }]
    }]
  });
} // 重新计算一个商品的总库存和总销量


function computeStocks(productId) {} // 字符串数字提取


function getNumber(str) {
  var fractionDigits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  str = str + "";
  str = str.replace("￥", "");
  str = parseFloat(str);
  str = str.toFixed(fractionDigits);
  return parseFloat(str);
} // 获取规格相关的dom


function getParamDom(productId, paramId) {
  var dom = $(".param[data-product-id='".concat(productId, "'][data-param-id='").concat(paramId, "']"));
  var originPrice = dom.find(".origin-price");
  var price = dom.find(".price");
  var name = dom.find(".name");
  var stocksSurplus = dom.find(".stocks-surplus");
  return {
    dom: dom,
    name: name,
    originPrice: originPrice,
    price: price,
    stocksSurplus: stocksSurplus
  };
} // 获取规格信息


function getParam(productId, paramId) {
  var _getParamDom = getParamDom(productId, paramId),
      dom = _getParamDom.dom,
      originPrice = _getParamDom.originPrice,
      price = _getParamDom.price,
      name = _getParamDom.name,
      stocksSurplus = _getParamDom.stocksSurplus;

  originPrice = getNumber(originPrice.text(), 2);
  var useDiscount = false;

  if (price.text() === "无") {
    price = "";
  } else {
    price = getNumber(price.text(), 2);
    useDiscount = true;
  }

  stocksSurplus = getNumber(stocksSurplus.text());
  var isEnable = true;
  if (dom.hasClass("disabled")) isEnable = false;
  name = name.text();
  return {
    name: name,
    isEnable: isEnable,
    useDiscount: useDiscount,
    originPrice: originPrice,
    price: price,
    stocksSurplus: stocksSurplus
  };
}

function setParam(productId, paramId, param) {
  var paramDom = getParamDom(productId, paramId);
  var name = param.name,
      originPrice = param.originPrice,
      price = param.price,
      useDiscount = param.useDiscount,
      stocksSurplus = param.stocksSurplus,
      isEnable = param.isEnable;
  var _NKC$methods$checkDat = NKC.methods.checkData,
      checkString = _NKC$methods$checkDat.checkString,
      checkNumber = _NKC$methods$checkDat.checkNumber;
  Promise.resolve().then(function () {
    checkString(name, {
      name: "名称",
      minLength: 1,
      maxLength: 100
    });
    checkNumber(stocksSurplus, {
      name: "库存",
      min: 0
    }), checkNumber(originPrice, {
      name: "价格",
      min: 0.01,
      fractionDigits: 2
    });

    if (useDiscount) {
      if (price >= originPrice) throw "规格优惠价必须小于原价";
      checkNumber(price, {
        name: "优惠价",
        min: 0.01,
        fractionDigits: 2
      });
    }

    if (isEnable) {
      paramDom.dom.removeClass("disabled");
    } else {
      paramDom.dom.addClass("disabled");
    }

    paramDom.name.text(name);
    paramDom.originPrice.text("\uFFE5".concat(originPrice.toFixed(2)));
    paramDom.stocksSurplus.text(stocksSurplus);

    if (useDiscount) {
      paramDom.price.text("\uFFE5".concat(price.toFixed(2))).addClass("number");
    } else {
      paramDom.price.text("\u65E0").removeClass("number");
    }

    var productDom = $(".product[data-product-id='".concat(productId, "'] .stocks-surplus"));
    var stocksDoms = $(".param[data-product-id='".concat(productId, "'] .stocks-surplus"));
    var count = 0;

    for (var i = 0; i < stocksDoms.length; i++) {
      var s = stocksDoms.eq(i);
      count += getNumber(s.text());
    }

    productDom.text(count);
  })["catch"](sweetError);
}