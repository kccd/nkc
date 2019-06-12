var data = getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    reviews: data.reviews
  },
  methods: {
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow,
    toCh: function(t) {
      return {
        "disabledPost": "删除",
        "disabledThread": "删除",
        "returnPost": "退修",
        "returnThread": "退修",
        "passPost": "通过审核",
        "passThread": "通过审核"
      }[t]
    }
  }
});