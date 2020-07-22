var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    loginSettings: data.loginSettings,
  },
  methods: {
    save: function() {
      var loginSettings = this.loginSettings;
      nkcAPI("/e/settings/login", "PUT", loginSettings)
        .then(function() {
          sweetSuccess("保存成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});
