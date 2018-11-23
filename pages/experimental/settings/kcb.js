var app = new Vue({
  el: '#app',
  data: {
    kcbsTypes: [],
    kcbSettings: {}
  },
  mounted: function() {
    var data = JSON.parse(this.$refs.data.innerText);
    this.kcbsTypes = data.kcbsTypes;
    this.kcbSettings = data.kcbSettings;

  },
  methods: {
    save: function() {
      nkcAPI('/e/settings/kcb', 'PATCH', {kcbsTypes: this.kcbsTypes, minCount: this.kcbSettings.minCount, maxCount: this.kcbSettings.maxCount})
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  }
});