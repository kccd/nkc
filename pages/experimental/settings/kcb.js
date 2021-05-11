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
    data.kcbSettings.withdrawMin = numToFloatTwo(data.kcbSettings.withdrawMin);
    data.kcbSettings.withdrawMax = numToFloatTwo(data.kcbSettings.withdrawMax);
    data.kcbSettings.withdrawTimeBegin = this.getHMS(data.kcbSettings.withdrawTimeBegin);
    data.kcbSettings.withdrawTimeEnd = this.getHMS(data.kcbSettings.withdrawTimeEnd);
    this.kcbSettings = data.kcbSettings;

  },
  methods: {
    getHMS: function(t) {
      return {
        hour: Math.floor(t/3600000),
        min: Math.floor(t/60000) % 60,
        sec: Math.floor(t/1000) % 60
      }
    },
    getMill: function(timeObj) {
      return timeObj.hour*60*60*1000 + timeObj.min*60*1000 + timeObj.sec*1000;
    },
    save: function() {
      this.kcbsTypesDemo = JSON.parse(JSON.stringify(this.kcbsTypes));
      for(var i in this.kcbsTypesDemo) {
        this.kcbsTypesDemo[i].num = this.kcbsTypesDemo[i].num * 100;
      }

      this.kcbSettingsDemo = JSON.parse(JSON.stringify(this.kcbSettings));
      this.kcbSettingsDemo.maxCount = this.kcbSettingsDemo.maxCount * 100;
      this.kcbSettingsDemo.minCount = this.kcbSettingsDemo.minCount * 100;
      this.kcbSettingsDemo.withdrawMin = this.kcbSettingsDemo.withdrawMin * 100;
      this.kcbSettingsDemo.withdrawMax = this.kcbSettingsDemo.withdrawMax * 100;
      this.kcbSettingsDemo.withdrawTimeBegin = this.getMill(this.kcbSettingsDemo.withdrawTimeBegin);
      this.kcbSettingsDemo.withdrawTimeEnd = this.getMill(this.kcbSettingsDemo.withdrawTimeEnd);
      if(this.kcbSettingsDemo.withdrawTimeBegin >= this.kcbSettingsDemo.withdrawTimeEnd) {
        return screenTopWarning("允许提现的时间段设置错误，开始时间必须小于结束时间");
      }
      nkcAPI('/e/settings/kcb', 'PUT', {
        kcbsTypes: this.kcbsTypesDemo,
        minCount: this.kcbSettingsDemo.minCount,
        maxCount: this.kcbSettingsDemo.maxCount,
        kcbSettings: this.kcbSettingsDemo
      })
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

window.numToFloatTwo = numToFloatTwo;
