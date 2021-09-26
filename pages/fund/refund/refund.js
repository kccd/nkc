const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: '#app',
  data: {
    donation: data.donation,
    formId: data.applicationFormId,
    refundMoney: data.refundMoney,
    paymentType: '',
    submitting: false,
    refundStatus: data.refundStatus,
  },
  computed: {
    disableAliPay() {
      return !this.donation.payment.aliPay.enabled;
    },
    disableWechatPay() {
      return !this.donation.payment.wechatPay.enabled;
    },
    fee() {
      if(!this.paymentType) return 0;
      return this.donation.payment[this.paymentType].fee;
    },
    totalMoney() {
      const {refundMoney, fee} = this;
      if(fee === null) return null;
      return Math.ceil(refundMoney * 100 * (1 + fee));
    },
    paymentInfo() {
      const {totalMoney, fee} = this;
      if(totalMoney === null) return '';
      return `服务商（非本站）将收取 ${fee * 100}% 的手续费，实际支付金额为 ${totalMoney / 100} 元`;
    }
  },
  methods: {
    init() {

    },
    submit() {
      const self = this;
      const {paymentType, formId, fee} = this;
      this.submitting = true;
      let newWindow;
      return Promise.resolve()
        .then(() => {
          if(
            NKC.methods.isPcBrowser() ||
            NKC.methods.isMobilePhoneBrowser()
          ) {
            newWindow = window.open();
          }
          return nkcAPI(`/fund/a/${formId}/refund`, 'POST', {
            paymentType,
            apiType: NKC.methods.isPcBrowser()? 'native': 'H5',
            fee
          });
        })
        .then((res) => {
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
        })
    }
  }
});