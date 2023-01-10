const CommonModal = new NKC.modules.CommonModal();
const Ship = new NKC.modules.ShopShip();
const ModifyPrice = new NKC.modules.ShopModifyPrice();
const Transfer = new NKC.modules.Transfer();
import * as XLSX from 'xlsx';
import {detailedTime} from "../../../lib/js/time";
import {getDataById} from "../../../lib/js/dataConversion";

const data = getDataById('data');
const ordersObject = {};
for(const order of data.orders) {
  ordersObject[order.orderId] = order;
}

window.selectAllOrder = function() {
  const elements = GetCheckboxInputElements();
  const selectedOrdersId = GetSelectedOrdersId();
  if(elements.length !== selectedOrdersId.length) {
    elements.prop('checked', true);
  } else {
    elements.prop('checked', false);
  }
}

window.exportData = function() {
  const ordersId = GetSelectedOrdersId();
  const orders = [];
  for(const orderId of ordersId) {
    const order = ordersObject[orderId];
    if(!order) continue;
    orders.push(order);
  }
  const ordersData = GetOrdersData(orders);
  if(ordersData.length === 0) {
    sweetError('请勾选需要导出的订单');
  } else {
    ExportFile(ordersData, `orders_${Date.now()}`);
  }
}

function ExportFile(ordersData, fileName) {
  const sheet = XLSX.utils.json_to_sheet(ordersData);
  const wb = XLSX.utils.book_new();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ignoreIndex = [3, 4, 5];
  const [_, endLetter] = sheet['!ref'].split(':').map(k => {
    return k.replace(/[0-9]/ig, '')
  });
  const endLetterIndex = letters.indexOf(endLetter) + 1;
  const mergeIndex = [];
  let sameIndex = [];
  let lastOrderId = '';
  for(let i = 0; i >= 0; i++) {
    const targetB = sheet[`B${i + 1}`];
    if(!targetB) break;
    const orderId = targetB.v;
    if(lastOrderId === orderId) {
      sameIndex.push(i);
    } else {
      if(sameIndex.length > 1) {
        mergeIndex.push([...sameIndex]);
      }
      lastOrderId = orderId;
      sameIndex = [i];
    }
    lastOrderId = targetB.v;
  }
  const merge = [];
  for(const mergeIndexArr of mergeIndex) {
    for(let i = 0; i < endLetterIndex; i++) {
      if(ignoreIndex.includes(i)) continue;
      merge.push({
        s: {r: mergeIndexArr[mergeIndexArr.length - 1], c: i},
        e: {r: mergeIndexArr[0], c: i}
      })
    }
  }
  sheet["!merges"] = merge;
  XLSX.utils.book_append_sheet(wb, sheet, fileName);
  const workbookBlob = workbook2blob(wb)
  openDownload(workbookBlob, `${fileName}.xls`)
}

function GetCheckboxInputElements() {
  return $('.order-info .checkbox label input[type="checkbox"]');
}

function workbook2blob(workbook) {
  const options = {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary',
  };
  const workData = XLSX.write(workbook, options);
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
    return buf;
  }
  return new Blob([s2ab(workData)], {
    type: 'application/octet-stream',
  });
}

function openDownload(blob, fileName) {
  if (typeof blob === 'object' && blob instanceof Blob) {
    blob = URL.createObjectURL(blob);
  }
  const aLink = document.createElement('a');
  aLink.href = blob;
  aLink.download = fileName || '';
  let event;
  if (window.MouseEvent) event = new MouseEvent('click');
  else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }
  aLink.dispatchEvent(event);
}

function GetSelectedOrdersId() {
  const elements = GetCheckboxInputElements();
  let selectedOrdersId = [];
  for(let i = 0; i < elements.length; i++) {
    const element = elements.eq(i);
    if(element.prop('checked')) {
      const orderId = element.attr('value');
      selectedOrdersId.push(orderId);
    }
  }
  return selectedOrdersId;
}

function GetOrdersData(orders) {
  const productions = [];
  for(const order of orders) {
    for(let i = 0; i < order.params.length; i++) {
      const param = order.params[i];
      productions.push({
        "时间": detailedTime(order.orderToc),
        "订单号": order.orderId,
        "买家": `${order.buyUser.username}(${order.buyUser.uid})`,
        "商品信息": `${param.product.name} - ${param.productParam.name}`,
        "商品数量": param.count,
        "商品价格（元）": param.singlePrice / 100,
        "运费（元）": order.orderFreightPrice / 100,
        "总价（元）": (order.orderPrice + order.orderFreightPrice) / 100,
        "收件人名称": order.receiveName,
        "收件人手机号": order.receiveMobile,
        "收货地址": order.receiveAddress,
        "买家备注": order.buyMessage || '无',
        "卖家备注": order.sellMessage || '无',
        "物流类型": order.trackNumber? order.freightName: '无',
        "物流单号": order.trackNumber || '无',
        "订单状态": order.status,
      });
    }
  }
  return productions;
}

window.transfer = function(tUid) {
  Transfer.open(function() {

  }, tUid);
}
// 修改卖家备注
window.modifySellMessage = function(uid, orderId) {
  const dom = $(`tr[data-order-id='${orderId}'] .data-sell-message`);
  CommonModal.open((data) => {
    const value = data[0].value;
    nkcAPI('/shop/manage/'+uid+'/order/editSellMessage', "PUT", {sellMessage: value, orderId: orderId})
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
window.getNumber = function(str, fractionDigits = 0) {
  str = str + "";
  str = str.replace("￥", "");
  str = parseFloat(str);
  str = str.toFixed(fractionDigits);
  return parseFloat(str);
}
// 重新计算订单总价
window.computeOrderPrice = function(orderId) {
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
window.modifyParamPrice = function(sellUid, orderId, costId) {
  const priceDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-price`);
  const countDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-count`);
  const freightDom = $(`tr[data-order-id='${orderId}'] .data-params-freight`);
  const freightPrice = getNumber(freightDom.text(), 2);
  const price = getNumber(priceDom.text(), 2);
  const count = getNumber(countDom.text(), 0);
  return ModifyPrice.open(data => {
    const newPrice = data;
    const checkNumber = NKC.methods.checkData.checkNumber;
    Promise.resolve()
      .then(() => {
        checkNumber(newPrice, {
          name: "商品单价",
          min: 0.01,
          fractionDigits: 2
        });
        return nkcAPI(`/shop/manage/${sellUid}/order/editCostRecord`, "PUT", {
          type: "modifyParam",
          costId,
          orderId,
          freightPrice: freightPrice * 100,
          costObj: {
            singlePrice: newPrice * 100,
            count
          }
        })
      })
      .then(() => {
        priceDom.text(`￥${newPrice.toFixed(2)}`);
        computeOrderPrice(orderId);
        CommonModal.close();
      })
      .catch(sweetError);
  }, price)
}

// 修改商品数量
window.modifyParamCount = function(sellUid, orderId, costId) {
  const countDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-count`);
  const priceDom = $(`tr[data-order-id='${orderId}'][data-order-param-id='${costId}'] .data-param-price`);
  const freightDom = $(`tr[data-order-id='${orderId}'] .data-params-freight`);
  const freightPrice = getNumber(freightDom.text(), 2);
  const price = getNumber(priceDom.text(), 2);
  const count = getNumber(countDom.text(), 0);
  CommonModal.open((data) => {
    const newCount = getNumber(data[0].value, 2);
    Promise.resolve()
      .then(() => {
        NKC.methods.checkData.checkNumber(newCount, {
          name: "商品数量",
          min: 1
        });
        return nkcAPI(`/shop/manage/${sellUid}/order/editCostRecord`, "PUT", {
          type: "modifyParam",
          costId,
          orderId,
          freightPrice: freightPrice * 100,
          costObj: {
            singlePrice: price * 100,
            count: newCount
          }
        })
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
window.modifyFreight = function(sellUid, orderId) {
  const freightDom = $(`tr[data-order-id='${orderId}'] .data-params-freight`);
  const freightPrice = getNumber(freightDom.text(), 2);
  return ModifyPrice.open(data => {
    const newFreightPrice = data;
    Promise.resolve()
      .then(() => {
        NKC.methods.checkData.checkNumber(newFreightPrice, {
          name: "运费",
          min: 0,
          fractionDigits: 2
        });
        return nkcAPI(`/shop/manage/${sellUid}/order/editCostRecord`, "PUT", {
          type: "modifyFreight",
          orderId,
          freightPrice: newFreightPrice * 100,
        });
      })
      .then(() => {
        freightDom.text(`￥${newFreightPrice.toFixed(2)}`);
        computeOrderPrice(orderId);
        CommonModal.close();
      })
      .catch(sweetError);
  }, freightPrice);
}
// 发货/修改物流信息
window.ship = function(orderId) {
  Ship.open(() => {

  }, {
    orderId
  })
}
