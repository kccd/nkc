"use strict";

var app = new Vue({
  el: "#app",
  data: {},
  mounted: function mounted() {
    window.SelectAddress = new NKC.modules.SelectAddress();
  },
  methods: {
    selectAddress: function selectAddress(address) {
      SelectAddress.open(function (d) {
        address.location = d.join(" ");
      }, {
        onlyChina: true
      });
    }
  }
});