const data = NKC.methods.getDataById('data');

const {alipay, wechat} = data.fundSettings.donation.payment;
alipay._fee = alipay.fee * 100;
wechat._fee = wechat.fee * 100;
const app = new Vue({
  el: '#app',
  data: {
    fundSettings: data.fundSettings,
    defaultMoney: data.fundSettings.donation.defaultMoney.join(', ')
  },
  methods: {
    save() {
      const {fundSettings} = this;
      const {alipay, wechat} = fundSettings.donation.payment;
      alipay.fee = alipay._fee / 100;
      wechat.fee = wechat._fee / 100;
      fundSettings.donation.defaultMoney = this.defaultMoney
        .replace(/[,，]/ig, ',')
        .split(',')
        .map(d => d.trim())
        .filter(d => !!d);
      nkcAPI(`/e/settings/fund`, 'PUT', {fundSettings})
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    }
  }
});