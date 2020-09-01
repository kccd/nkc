var data = NKC.methods.getDataById('data');
var app = new Vue({
  el: "#app",
  data: {
    pageSettings: data.pageSettings,
  },
  methods: {
    save: function() {
      nkcAPI("/e/settings/page", "PUT", {
        pageSettings: this.pageSettings
      })
        .then(function() {
          sweetSuccess('保存成功');
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});
