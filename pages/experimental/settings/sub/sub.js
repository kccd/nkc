var app = new Vue({
  el: "#app",
  data: {
    error: "",
    info: "",
    subSettings: ""
  },
  mounted: function() {
    var data = NKC.methods.getDataById("data");
    this.subSettings = data.subSettings;
  },
  methods: {
    save: function() {
      this.error = "";
      this.info = "";
      var subSettings = this.subSettings;
      if(
        subSettings.subUserCountLimit < 0 ||
        subSettings.subForumCountLimit < 0 ||
        subSettings.subThreadCountLimit < 0
      ) return this.error = "";
      nkcAPI("/e/settings/sub", "PATCH", subSettings)
        .then(function() {
          app.info = "保存成功";
        })
        .catch(function(data) {
          app.error = data.error || data;
        });
    }
  }
});