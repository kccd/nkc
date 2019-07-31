var app = new Vue({
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
        total += cart.count * cart.productParam.price/100;
      }
      return total;
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
      nkcAPI('/shop/cart/' + c._id, 'PATCH', {
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
      nkcAPI('/shop/cart/' + c._id, 'PATCH', {
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
      nkcAPI('/shop/cart/' + c._id, 'PATCH', {
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
});