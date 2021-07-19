const data = NKC.methods.getDataById('data');

import FromNow from '../lib/vue/FromNow.vue';

window.donationApp = new Vue({
  el: '#donationApp',
  data: {
    donation: data.donation,
    funds: data.funds,
    money: null,
    fundId: null,
    paymentType: null,
    inputMoney: false,
    customMoney: null,
    submitting: false,
    anonymous: false,
    donationEnabled: data.donationEnabled,

    donationBills: data.donationBills,
  },
  components: {
    'from-now': FromNow
  },
  computed: {
    targets() {
      const {funds} = this;
      const arr = [
        {
          name: '资金池',
          type: 'fundPool'
        }
      ];
      for(const f of funds) {
        arr.push({
          name: f.name,
          type: f._id
        });
      }
      return arr;
    },
    payment() {
      const {aliPay, wechatPay} = this.donation.payment;
      const arr = [];
      if (aliPay.enabled) {
        arr.push({
          type: 'aliPay',
          name: '支付宝'
        });
      }
      if(wechatPay.enabled) {
        arr.push({
          type: 'wechatPay',
          name: '微信'
        });
      }
      return arr;
    },
    fee() {
      const {payment} = this.donation;
      const {paymentType} = this;
      const paymentData = payment[paymentType];
      if(!paymentData) return null;
      return paymentData.fee;
    },
    realMoney() {
      const {money, inputMoney, customMoney} = this;
      if(inputMoney) {
        return Math.ceil(customMoney * 100);
      } else {
        return money;
      }
    },
    totalMoney() {
      const {realMoney, fee} = this;
      if(fee === null) return null;
      return Math.ceil(realMoney * (1 + fee));
    },
    paymentInfo() {
      const {totalMoney, fee} = this;
      if(totalMoney === null) return '';
      return `服务商（非本站）将收取 ${fee * 100}% 的手续费，实际支付金额为 ${totalMoney / 100} 元`;
    }
  },
  mounted() {
    this.selectFund(this.targets[0].type);
    this.selectMoney(this.donation.defaultMoney[0]);
    this.selectPaymentType(this.payment[0].type);
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    selectFund(fundId) {
      this.fundId = fundId;
    },
    selectMoney(money) {
      this.inputMoney = false;
      this.money = money;
    },
    selectPaymentType(type) {
      this.paymentType = type;
    },
    toInputNumber() {
      this.money = null;
      this.inputMoney = true;
    },
    formatInputMoney() {
      let customMoney = Number(this.customMoney.toFixed(2));
      if(isNaN(customMoney)) customMoney = 0;
      this.customMoney = customMoney;
    },
    submit() {
      this.submitting = true;
      const self = this;
      const {
        realMoney,
        paymentType,
        fee,
        totalMoney,
        donation,
        anonymous,
        fundId
      } = this;
      let newWindow = null;
      return Promise.resolve()
        .then(() => {
          if(totalMoney < donation.min) {
            throw new Error(`赞助金额不能小于 ${donation.min / 100} 元`);
          }
          if(totalMoney > donation.max) {
            throw new Error(`赞助金额不能大于 ${donation.min / 100} 元`);
          }
          if(
            NKC.methods.isPcBrowser() ||
            NKC.methods.isMobilePhoneBrowser()
          ) {
            newWindow = window.open();
          }
          return nkcAPI('/fund/donation', 'POST', {
            money: realMoney,
            fee,
            apiType: NKC.methods.isPcBrowser()? 'native': 'H5',
            paymentType,
            fundId,
            anonymous,
          });
        })
        .then(res => {
          const {aliPaymentInfo, wechatPaymentInfo} = res;
          if(wechatPaymentInfo) {
            NKC.methods.toPay('wechatPay', wechatPaymentInfo, newWindow);
          } else if(aliPaymentInfo) {
            NKC.methods.toPay('aliPay', aliPaymentInfo, newWindow);
          }
          self.submitting = false;
          sweetInfo('请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。');
        })
        .catch(error => {
          self.submitting = false;
          if(newWindow && newWindow.close) newWindow.close();
          sweetError(error);
        });
    }
  }
});