var app = new Vue({
  el: "#app",
  data: {
    pageSettings: "",
    error: "",
    info: ""
  },
  mounted: function() {
    var data = NKC.methods.getDataById("data");
    this.pageSettings = data.pageSettings;
  },
  methods: {
    save: function() {
      this.error = "";
      this.info = "";
      nkcAPI("/e/settings/page", "PATCH", {
        pageSettings: this.pageSettings
      })
        .then(function() {
          app.info = "保存成功";
        })
        .catch(function(data) {
          app.error = data.error || data;
        })
    }
  }
});