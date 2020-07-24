/*var app = new Vue({
  el: '#app',
  data: {
    cartData: [],
    selectedId: []
  },
  computed: {
    carts: function() {
      var arr = {};
      for(var i = 0 ; i < this.cartData.length; i++) {
        var carts = this.cartData[i].products;
        for(var j = 0; j < carts.length; j++) {
          var cart = carts[j];
          arr[cart._id] = cart;
        }
      }
      return arr;
    },
    total: function() {
      var selectedId = this.selectedId;
      var total = 0;
      for(var i = 0; i < selectedId.length; i++) {
        var cart = this.carts[selectedId[i]];
        total += cart.count * cart.productParam.price;
      }
      return (total/100).toFixed(2);
    }
  },
  mounted: function() {
    var data = document.getElementById('data');
    if(data) {
      data = JSON.parse(data.innerHTML);
      this.cartData = data.cartData;
    }
  },
  methods: {
    visitUrl: NKC.methods.visitUrl,
    floatUserInfo: NKC.methods.tools.floatUserInfo,
    deleteCartData: function(c) {
      nkcAPI('/shop/cart/' + c._id, 'DELETE')
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopwarning(data);
        })
    },
    reduceCount: function(c) {
      if(c.count === 1) return;
      nkcAPI('/shop/cart/' + c._id, 'PUT', {
        type: 'reduceCount'
      })
        .then(function(data) {
          c.count = data.count;
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    addCount: function(c) {
      nkcAPI('/shop/cart/' + c._id, 'PUT', {
        type: 'addCount'
      })
        .then(function(data) {
          c.count = data.count;
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    changeCount: function(c) {
      nkcAPI('/shop/cart/' + c._id, 'PUT', {
        type: 'changeCount',
        count: c.count
      })
        .then(function(data) {
          c.count = data.count;
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    selectedAll: function(d) {
      var cartId = [];
      for(var i = 0; i < d.products.length; i++) {
        cartId.push(d.products[i]._id);
      }
      var selectedAll = true;
      for(var i = 0 ; i < cartId.length; i++) {
        if(app.selectedId.indexOf(cartId[i]) === -1) {
          selectedAll = false;
          break;
        }
      }
      if(!selectedAll) {
        for(var i = 0 ; i < cartId.length; i++) {
          if(app.selectedId.indexOf(cartId[i]) === -1) {
            app.selectedId.push(cartId[i]);
          }
        }
      } else {
        for(var i = 0 ; i < cartId.length; i++) {
          var index = app.selectedId.indexOf(cartId[i]);
          if(index !== -1) {
            app.selectedId.splice(index, 1);
          }
        }
      }
    }
  }
});*/

// 同一卖家 选择全部
function selectAll(cartId) {
  var dom = $("input[data-index='"+cartId+"']");
  var inputCount = dom.length;
  var selectedCount = 0;
  for (var i = 0 ; i < inputCount; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) selectedCount ++;
  }
  if(selectedCount !== inputCount) {
    dom.prop("checked", true);
  } else {
    dom.prop("checked", false);
  }
  showButton()
}
function getNumber(str, fractionDigits) {
  if(fractionDigits === undefined) {
    fractionDigits = 0;
  }
  str = str + "";
  str = str.replace("￥", "");
  str = parseFloat(str);
  str = str.toFixed(fractionDigits);
  return parseFloat(str);
}
// 改数量
function changeCount(type, productId) {
  var dom = $(".data-param-count[data-product-id='"+productId+"']");
  if(type === "up") {
    type = "addCount"
  } else {
    type = "reduceCount";
  }
  nkcAPI('/shop/cart/' + productId, 'PUT', {
    type: type
  })
    .then(function(data) {
      dom.text(data.count);
      computePrice();
    })
    .catch(sweetError);
}


function computePrice() {
  var productsDom = $(".cart-product");
  var selectedPrice = 0;
  for(var i = 0; i < productsDom.length; i++) {
    var dom = productsDom.eq(i);
    var price = getNumber(dom.find(".fact-price").text(), 2);
    var count = getNumber(dom.find(".data-param-count").text());
    var total = price * count;
    if(dom.find("label input").prop("checked")) {
      selectedPrice += total;
    }
    dom.find(".data-param-prices").text("￥"+total.toFixed(2));
  }
  var buttonDom = $(".cart-total-price");
  buttonDom.find(".cart-price-number").text("￥" + selectedPrice.toFixed(2));
}

function deleteCart(productId) {
  nkcAPI('/shop/cart/' + productId, 'DELETE')
    .then(function() {
      window.location.reload();
    })
    .catch(sweetError)
}

//  显示结算总价
function showButton() {
  var dom = $(".cart-product input");
  var buttonDom = $(".cart-total-price");
  var inputCount = dom.length;
  var selectedCount = 0;
  for (var i = 0 ; i < inputCount; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) selectedCount ++;
  }
  if(selectedCount > 0) {
    buttonDom.show();
  } else {
    buttonDom.hide();
  }
  computePrice();
}
// 下一步 去结算
function next() {
  var dom = $(".cart-product input");
  var arr = [];
  for (var i = 0 ; i < dom.length; i++) {
    var d = dom.eq(i);
    if(d.prop("checked")) arr.push(d.attr("data-product-id"))
  }
  NKC.methods.visitUrl('/shop/bill?cartsId=' + arr.join('-'));
}

