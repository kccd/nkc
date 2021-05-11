var app = new Vue({
  el: "#app",
  data: {
    shopSettings: ''
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(decodeURIComponent(data.innerHTML));
    this.shopSettings = data.shopSettings;
  },
  methods: {
    save: function() {
      nkcAPI("/e/settings/shop/refunds/settings", "PUT", {
        shopSettings: app.shopSettings
      })
        .then(function() {
          screenTopAlert("保持成功");
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    }
  }
})
