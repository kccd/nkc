import {getDataById} from "../../lib/js/dataConversion";
import {checkNumber} from "../../lib/js/checkData";
import {sweetError, sweetSuccess} from "../../lib/js/sweetAlert";

const data = getDataById('data');

for(const share of data.shares) {
  share.kcb = share.kcb / 100;
  share.maxKcb = share.maxKcb / 100;
}

data.shareRegister.kcb = data.shareRegister.kcb / 100;
data.shareRegister.maxKcb = data.shareRegister.maxKcb / 100;
data.shareRegister.count = data.shareRegister.count / 100; // 分享奖励上限

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
    shares: data.shares,
    shareRegister: data.shareRegister,
    randomDemo: {},
    draftFeeDemo: {},
    shareDemo: {},
  },
  mounted: function() {
    // var data = document.getElementById('data');
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
    /*var arr = [];
    var obj = {};
    var s;*/
    // 处理分享奖励设置
    /*for(var key in data.redEnvelopeSettings.share) {
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
    this.share = obj;*/
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
    getShareRegister() {
      const {
        status,
        kcb,
        maxKcb,
        count,
      } = this.shareRegister;

      checkNumber(kcb, {
        name: '分享注册奖励 - 单次注册奖励',
        min: 0,
        fractionDigits: 2
      });
      checkNumber(maxKcb, {
        name: '分享注册奖励 - 同一分享获得注册奖励上限',
        min: 0,
        fractionDigits: 2
      });
      checkNumber(count, {
        name: '分享注册奖励 - 每天获得注册奖励上限',
        min: 0,
        fractionDigits: 2
      });

      return {
        status,
        kcb: kcb * 100,
        maxKcb: maxKcb * 100,
        count: count * 100,
      }
    },
    getShares() {
      const {shares} = this;
      const sharesData = [];
      for(const s of shares) {
        const {
          type,
          kcb,
          maxKcb,
          rewardCount,
          rewardStatus
        } = s;

        checkNumber(kcb, {
          name: '分享奖励 - 单次点击奖励',
          min: 0,
          fractionDigits: 2
        });
        checkNumber(maxKcb, {
          name: '分享奖励 - 同一分享奖励上限',
          min: 0,
          fractionDigits: 2
        });
        checkNumber(rewardCount, {
          name: '分享奖励 - 每天分享次数上限',
          min: 0,
        });

        sharesData.push({
          type,
          kcb: kcb * 100,
          maxKcb: maxKcb * 100,
          rewardCount,
          rewardStatus
        });
      }
      return sharesData;
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

      var data = {
        random: this.randomDemo,
        draftFee: this.draftFeeDemo,
      };

      const self = this;

      return Promise.resolve()
        .then(() => {
          data.shares = self.getShares();
          data.shareRegister = self.getShareRegister();
          return nkcAPI('/e/settings/red-envelope',  'PUT', data)
        })
        .then(function() {
          sweetSuccess('保存成功');
        })
        .catch(function(data) {
          sweetError(data.error || data);
        })
    }
  }
});

function numToFloatTwo(str){
  str = (str/100).toFixed(2);
  return str;
}

window.numToFloatTwo = numToFloatTwo;
