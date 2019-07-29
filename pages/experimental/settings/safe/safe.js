var app = new Vue({
  el: "#app",
  data: {
    safeSettings: "",
    error: "",
    info: ""
  },
  mounted: function() {
    var data = NKC.methods.getDataById("data");
    this.safeSettings = data.safeSettings;
  },
  methods: {
    save: function() {
      this.error = "";
      this.info = "";
      var safeSettings = this.safeSettings;
      if(safeSettings.experimentalTimeout >= 5){}
      else {
        return this.error = "后台密码过期时间不能小于5分钟"
      }
      nkcAPI("/e/settings/safe", "PATCH", {
        safeSettings: safeSettings
      })
        .then(function() {
          app.info = "保存成功";
        })
        .catch(function(data) {
          app.error = data.error || data;
        });
    }
  }
});