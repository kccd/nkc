var app = new Vue({
  el: '#app',
  data: {
    shareLimit: [],
  },
  methods: {
    submit: function() {
      var obj = {};
      obj.shareLimit = app.shareLimit;
      nkcAPI('/e/settings/share', 'PATCH', obj)
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    },
    add: function() {
      var limit = {
        shareName: "",
        shareType: "",
        shareLimitTime: "",
        shareLimitCount: ""
      }
      app.shareLimit.push(limit)
    },
    del: function(key) {
      app.shareLimit.splice(key,1)
    }
  },
  mounted: function() {
    nkcAPI('/e/settings/share', 'GET', {})
      .then(function(data) {
        app.shareLimit = data.shareLimit;
      })
      .catch(function(data) {
        screenTopWarning(data.error || data);
      });
  }
});
