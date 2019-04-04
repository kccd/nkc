var app = new Vue({
  el: '#app',
  data: {
    kcbsTypes: [],
    kcbsTypesDemo: [],
    kcbSettings: {},
    kcbSettingsDemo: {},
  },
  mounted: function() {
    var data = JSON.parse(this.$refs.data.innerText);
    for(var i in data.kcbsTypes) {
      data.kcbsTypes[i].num = numToFloatTwo(data.kcbsTypes[i].num);
    }
    this.kcbsTypes = data.kcbsTypes;

    data.kcbSettings.maxCount = numToFloatTwo(data.kcbSettings.maxCount);
    data.kcbSettings.minCount = numToFloatTwo(data.kcbSettings.minCount);
    this.kcbSettings = data.kcbSettings;

  },
  methods: {
    save: function() {
      this.kcbsTypesDemo = JSON.parse(JSON.stringify(this.kcbsTypes));
      for(var i in this.kcbsTypesDemo) {
        this.kcbsTypesDemo[i].num = this.kcbsTypesDemo[i].num * 100;
      }

      this.kcbSettingsDemo = JSON.parse(JSON.stringify(this.kcbSettings));    
      this.kcbSettingsDemo.maxCount = this.kcbSettingsDemo.maxCount * 100;
      this.kcbSettingsDemo.minCount = this.kcbSettingsDemo.minCount * 100;
      nkcAPI('/e/settings/kcb', 'PATCH', {kcbsTypes: this.kcbsTypesDemo, minCount: this.kcbSettingsDemo.minCount, maxCount: this.kcbSettingsDemo.maxCount})
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  }
});


function numToFloatTwo(str){
  str = (str/100).toFixed(2);
  return str;
}