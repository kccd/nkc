var app = new Vue({
  el: '#app',
  data: {
    random: {
      close: false,
      awards: []
    },
    draftFee: {
      close: false,
      defaultCount: 1,
      minCount: 1,
      maxCount: 5
    },
    share: {},
    randomDemo: {},
    draftFeeDemo: {},
    shareDemo: {},
  },
  mounted: function() {
    // var data = document.getElementById('data');
    var data = NKC.methods.getDataById('data');
    // 处理随机红包
    for(var ra in data.redEnvelopeSettings.random.awards) {
      data.redEnvelopeSettings.random.awards[ra].kcb = numToFloatTwo(data.redEnvelopeSettings.random.awards[ra].kcb);
    }
    this.random = data.redEnvelopeSettings.random;
    // 处理精选稿费
    data.redEnvelopeSettings.draftFee.defaultCount = numToFloatTwo(data.redEnvelopeSettings.draftFee.defaultCount);
    data.redEnvelopeSettings.draftFee.minCount = numToFloatTwo(data.redEnvelopeSettings.draftFee.minCount);
    data.redEnvelopeSettings.draftFee.maxCount = numToFloatTwo(data.redEnvelopeSettings.draftFee.maxCount);
    this.draftFee = data.redEnvelopeSettings.draftFee;
    var arr = [];
    var obj = {};
    var s;
    // 处理分享奖励设置
    for(var key in data.redEnvelopeSettings.share) {
      if (!data.redEnvelopeSettings.share.hasOwnProperty(key)) continue;
      s = data.redEnvelopeSettings.share[key];
      s.id = key;
      arr[s.order-1] = s;
    }
    for(var i = 0; i < arr.length; i++) {
      s = arr[i];
      s.maxKcb = numToFloatTwo(s.maxKcb);
      s.kcb = numToFloatTwo(s.kcb);
      obj[s.id] = s;
      delete s.id;
    }
    this.share = obj;
    // this.share = data.redEnvelopeSettings.share;
    if(this.random.awards.length === 0) {
      this.random.awards = [{
        name: '',
        kcb: '',
        chance: '',
        float: ''
      }];
    }
  },
  methods: {
    remove: function(index) {
      this.random.awards.splice(index, 1);
    },
    add: function(index) {
      this.random.awards.splice(index+1, 0, {
        name: '',
        kcb: '',
        chance: '',
        float: ''
      });
    },
    save: function(){
      if(this.random.close === 'false') {
        this.random.close = false;
      }
      if(this.random.close === 'true') {
        this.random.close = true;
      }
      if(this.draftFee.close === 'false') {
        this.draftFee.close = false;
      }
      if(this.draftFee.close === 'true') {
        this.draftFee.close = true;
      }
      // 处理随机红包数额
      this.randomDemo = JSON.parse(JSON.stringify(this.random));
      for(var rad in this.randomDemo.awards){
        this.randomDemo.awards[rad].kcb = this.randomDemo.awards[rad].kcb * 100;
      }
      // 处理精选稿费
      this.draftFeeDemo = JSON.parse(JSON.stringify(this.draftFee));
      this.draftFeeDemo.defaultCount = this.draftFeeDemo.defaultCount * 100;
      this.draftFeeDemo.maxCount = this.draftFeeDemo.maxCount * 100;
      this.draftFeeDemo.minCount = this.draftFeeDemo.minCount * 100;
      // 处理分享奖励设置
      this.shareDemo = JSON.parse(JSON.stringify(this.share));
      for(var sd in this.shareDemo) {
        this.shareDemo[sd].maxKcb = this.shareDemo[sd].maxKcb * 100;
        this.shareDemo[sd].kcb = this.shareDemo[sd].kcb * 100;
      }
      var data = {
        random: this.randomDemo,
        draftFee: this.draftFeeDemo,
        share: this.shareDemo
      };
      nkcAPI('/e/settings/red-envelope',  'PUT', data)
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
