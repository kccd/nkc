const data = NKC.methods.getDataById('data');

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
  },
  computed: {
    targets() {
      const {funds} = this;
      const arr = [
        {
          name: '资金池',
          type: 'pool'
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
      const {alipay, wechat} = this.donation.payment;
      const arr = [];
      if (alipay.enabled) {
        arr.push({
          type: 'alipay',
          name: '支付宝'
        });
      }
      if(wechat.enabled) {
        arr.push({
          type: 'wechat',
          name: '微信'
        });
      }
      return arr;
    },
    paymentInfo() {
      const {payment} = this.donation;
      const {paymentType} = this;
      const {fee} = payment[paymentType];
      return `服务商（非本站）将收取 ${fee * 100}% 的手续费`;
    }
  },
  mounted() {
    this.selectFund(this.targets[0].type);
    this.selectMoney(this.donation.defaultMoney[0]);
    this.selectPaymentType(this.payment[0].type);
  },
  methods: {
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
      let customMoney = parseInt(this.customMoney);
      if(isNaN(customMoney)) customMoney = 0;
      this.customMoney = customMoney;
    },
    submit() {
      this.submitting = true;
    }
  }
});