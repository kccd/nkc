var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    cacheSettings: data.cacheSettings,
    error: "",
    info: ""
  },
  methods: {
    save: function() {
      this.info = "";
      this.error = "";
      var cache = this.cacheSettings;
      nkcAPI("/e/settings/cache", "PATCH", {
        type: "modify",
        cache: cache
      })
        .then(function() {
          sweetSuccess("保存成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    clearAll: function() {
      nkcAPI("/e/settings/cache", "PATCH", {
        type: "clear"
      })
        .then(function() {
          sweetSuccess("清除缓存成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});