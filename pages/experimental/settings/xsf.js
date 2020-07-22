var app = new Vue({
  el: '#app',
  data: {
    xsfSettings: ''
  },
  mounted: function() {
    var data = JSON.parse(this.$refs.data.innerText);
    this.xsfSettings = data.xsfSettings;
  },
  methods: {
    save: function() {
      nkcAPI('/e/settings/xsf', 'PUT', {xsfSettings: this.xsfSettings})
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        });
    }
  }
});
