var app = new Vue({
  el: '#app',
  data: {
    cartData: []
  },
  mounted: function() {
    var data = document.getElementById('data');
    if(data) {
      data = JSON.parse(data.innerHTML);
      this.cartData = data.cartData;
    }
  },
  methods: {

  }
});