const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: '#app',
  data: {
    submitting: false,
    recharge: null,
    withdraw: null
  },
  mounted() {
    const {recharge, withdraw} = data.rechargeSettings;
    // 处理提现时间限制
    withdraw._startingTime = this.getHMS(withdraw.startingTime);
    withdraw._endTime = this.getHMS(withdraw.endTime);
    // 转换金额
    this.convertNumber(withdraw, 'toPage');
    this.convertNumber(recharge, 'toPage');
    this.recharge = recharge;
    this.withdraw = withdraw;
  },
  methods: {
    getHMS,
    HMSToNumber,
    checkNumber: NKC.methods.checkData.checkNumber,
    checkString: NKC.methods.checkData.checkString,
    bigNumber: NKC.modules.math.bignumber,
    convertNumber(withdraw, type) { // type: toPage, toServer
      if(type === 'toPage') {
        withdraw._min = withdraw.min / 100;
        withdraw._max = withdraw.max / 100;
        withdraw.aliPay._fee = NKC.modules.math.chain(this.bigNumber(withdraw.aliPay.fee)).multiply(100).done().toNumber();
        withdraw.weChat._fee = NKC.modules.math.chain(this.bigNumber(withdraw.weChat.fee)).multiply(100).done().toNumber();
      } else {
        withdraw.min = withdraw._min * 100;
        withdraw.max = withdraw._max * 100;
        withdraw.aliPay.fee = NKC.modules.math.chain(this.bigNumber(withdraw.aliPay._fee)).multiply(this.bigNumber(0.01)).done().toNumber();
        withdraw.weChat.fee = NKC.modules.math.chain(this.bigNumber(withdraw.weChat._fee)).multiply(this.bigNumber(0.01)).done().toNumber();
        delete withdraw.aliPay._fee;
        delete withdraw.weChat._fee;
        delete withdraw._min;
        delete withdraw._max;
      }
    },
    save() {
      const recharge = JSON.parse(JSON.stringify(this.recharge));
      const withdraw = JSON.parse(JSON.stringify(this.withdraw));
      const {checkNumber} = this;
      const self = this;
      Promise.resolve()
        .then(() => {
          checkNumber(recharge._min, {
            name: '单次最小充值金额',
            min: 0.01,
            fractionDigits: 2,
          });
          checkNumber(recharge._max, {
            name: '单次最大充值金额',
            min: 0.01,
            fractionDigits: 2
          });
          if(recharge._min > recharge._max) throw `单次充值金额设置错误`;
          checkNumber(recharge.aliPay._fee, {
            name: '支付宝充值手续费',
            min: 0,
            max: 100,
            fractionDigits: 2
          });
          checkNumber(recharge.weChat._fee, {
            name: '微信支付充值手续费',
            min: 0,
            max: 100,
            fractionDigits: 2
          });
          checkNumber(withdraw._min, {
            name: '单次最小提现金额',
            min: 0.01,
            fractionDigits: 2,
          });
          checkNumber(withdraw._max, {
            name: '单次最大提现金额',
            min: 0.01,
            fractionDigits: 2
          });
          if(withdraw._min > withdraw._max) throw `单次提现金额设置错误`;
          checkNumber(withdraw.countOneDay, {
            name: '每天最大提现次数',
            min: 0
          });
          checkNumber(withdraw.aliPay._fee, {
            name: '支付宝提现手续费',
            min: 0,
            max: 100,
            fractionDigits: 2
          });
          checkNumber(withdraw.weChat._fee, {
            name: '微信支付提现手续费',
            min: 0,
            max: 100,
            fractionDigits: 2
          });
          withdraw.startingTime = this.HMSToNumber(withdraw._startingTime);
          withdraw.endTime = this.HMSToNumber(withdraw._endTime);
          delete withdraw._startingTime;
          delete withdraw._endTime;
          this.convertNumber(withdraw, 'toServer');
          this.convertNumber(recharge, 'toServer');
          this.submitting = true;
          return nkcAPI('/e/settings/recharge', 'PUT', {recharge, withdraw})
        })
        .then(() => {
          self.submitting = false;
          sweetSuccess('保存成功');
        })
        .catch(err => {
          self.submitting = false;
          sweetError(err);
        });
    }
  }
});

function getHMS(t) {
  return {
    hour: Math.floor(t/3600000),
    min: Math.floor(t/60000) % 60,
    sec: Math.floor(t/1000) % 60
  }
}

function HMSToNumber(t) {
  return t.hour * 60 * 60 * 1000 + t.min * 60 * 1000 + t.sec * 1000;
}

Object.assign(window, {
  getHMS,
  HMSToNumber
});
