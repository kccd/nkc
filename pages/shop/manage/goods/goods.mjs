const CommonModal = new NKC.modules.CommonModal();
window.modifyParam = function (productId, paramId) {
  const param = getParam(productId, paramId);
  CommonModal.open(data => {
    const paramData = {
      name: data[0].value,
      originPrice: data[1].value,
      stocksSurplus: data[2].value,
      price: data[3].value,
      useDiscount: data[4].value,
      isEnable: data[5].value,
      paramId,
      productId
    };


    nkcAPI(`/shop/manage/${NKC.configs.uid}/goodslist/editParam`, "PATCH", {paramData})
      .then(() => {
        sweetSuccess("修改成功");
        CommonModal.close();
        setParam(productId, paramId, paramData);    
      })
      .catch(sweetError)
    
  }, {
    title: "修改规格",
    data: [
      {
        dom: "input",
        type: "text",
        label: "名称",
        value: param.name
      },
      {
        dom: "input",
        type: "number",
        label: "价格（元，精确到0.01）",
        value: param.originPrice
      },
      {
        dom: "input",
        type: "number",
        label: "库存",
        value: param.stocksSurplus
      },
      {
        dom: "input",
        type: "number",
        label: "优惠价（元，精确到0.01）",
        value: param.price
      },
      {
        dom: "radio",
        label: "是否使用优惠价",
        value: param.useDiscount,
        radios: [
          {
            value: true,
            name: "是"
          },
          {
            value: false,
            name: "否"
          }
        ]
      },
      {
        dom: "radio",
        label: "是否屏蔽",
        value: param.isEnable,
        radios: [
          {
            value: false,
            name: "是"
          },
          {
            value: true,
            name: "否"
          }
        ]
      }
    ]
  });
}

// 重新计算一个商品的总库存和总销量
window.computeStocks = function(productId) {

}

// 字符串数字提取
window.getNumber = function(str, fractionDigits = 0) {
  str = str + "";
  str = str.replace("￥", "");
  str = parseFloat(str);
  str = str.toFixed(fractionDigits);
  return parseFloat(str);
}

// 获取规格相关的dom
window.getParamDom = function(productId, paramId) {
  const dom = $(`.param[data-product-id='${productId}'][data-param-id='${paramId}']`);
  let originPrice = dom.find(".origin-price");
  let price = dom.find(".price");
  let name = dom.find(".name");
  let stocksSurplus = dom.find(".stocks-surplus");
  return {
    dom,
    name,
    originPrice,
    price,
    stocksSurplus
  }
}

// 获取规格信息
window.getParam = function(productId, paramId) {
  let {
    dom,
    originPrice,
    price,
    name,
    stocksSurplus
  } = getParamDom(productId, paramId);
  originPrice = getNumber(originPrice.text(), 2);
  let useDiscount = false;
  if(price.text() === "无") {
    price = "";
  } else {
    price = getNumber(price.text(), 2);
    useDiscount = true;
  }
  stocksSurplus = getNumber(stocksSurplus.text());
  let isEnable = true;
  if(dom.hasClass("disabled")) isEnable = false;
  name = name.text();
  return {
    name,
    isEnable,
    useDiscount,
    originPrice,
    price,
    stocksSurplus
  }
}

window.setParam = function(productId, paramId, param) {
  const paramDom = getParamDom(productId, paramId);
  const {
    name, 
    originPrice,
    price,
    useDiscount,
    stocksSurplus,
    isEnable
  } = param;

  const {checkString, checkNumber} = NKC.methods.checkData;

  Promise.resolve()
    .then(() => {
      checkString(name, {
        name: "名称",
        minLength: 1,
        maxLength: 100
      });
      checkNumber(stocksSurplus, {
        name: "库存",
        min: 0
      }),
      checkNumber(originPrice, {
        name: "价格",
        min: 0.01,
        fractionDigits: 2
      });
      if(useDiscount) {
        if(price >= originPrice) throw "规格优惠价必须小于原价";
        checkNumber(price, {
          name: "优惠价",
          min: 0.01,
          fractionDigits: 2
        });
      }
      if(isEnable) {
        paramDom.dom.removeClass("disabled");
      } else {
        paramDom.dom.addClass("disabled");
      }
      paramDom.name.text(name);
      paramDom.originPrice.text(`￥${originPrice.toFixed(2)}`);
      paramDom.stocksSurplus.text(stocksSurplus);
      if(useDiscount) {
        paramDom.price.text(`￥${price.toFixed(2)}`).addClass("number");
      } else {
        paramDom.price.text(`无`).removeClass("number");
      }
      const productDom = $(`.product[data-product-id='${productId}'] .stocks-surplus`);
      const stocksDoms = $(`.param[data-product-id='${productId}'] .stocks-surplus`);
      let count = 0;
      for(let i = 0 ; i < stocksDoms.length; i++) {
        const s = stocksDoms.eq(i);
        count += getNumber(s.text());
      }
      productDom.text(count);
    })
    .catch(sweetError);
}

/*
* 立即上架
* */
window.shelfNow = function(productId) {
  sweetQuestion("确认要上架该商品？")
    .then(() => {
      return nkcAPI(`/shop/manage/${NKC.configs.uid}/goodslist/shelfRightNow`, "PATCH", {productId});
    })
    .then(() => {
      sweetSuccess("商品已上架");
    })
    .catch(sweetError);
}
/**
 * 商品停售
 */
window.stopSale = function(productId) {
  sweetQuestion("确认要停售该商品？")
    .then(() => {
      return nkcAPI(`/shop/manage/${NKC.configs.uid}/goodslist/productStopSale`, "PATCH", {productId});
    })
    .then(() => {
      sweetSuccess("商品已停售");
    })
    .catch(sweetError);
}

/**
 * 商品复售
 */
window.goonSale = function(productId) {
  sweetQuestion("确认要复售该商品？")
    .then(() => {
      return nkcAPI(`/shop/manage/${NKC.configs.uid}/goodslist/productGoonSale`, "PATCH", {productId});
    })
    .then(() => {
      sweetSuccess("商品已复售");
    })
    .catch(sweetError);
}