import {getDataById} from "../../../lib/js/dataConversion";
const data = getDataById('data');
const app = new Vue({
  el: '#app',
  data: {
    shares: data.shares
  },
  methods: {
    submit() {
      const {shares} = this;
      return nkcAPI(`/e/settings/share`, 'PUT', {
        shares
      })
        .then(() => {
          sweetSuccess(`提交成功`);
        })
        .catch(sweetError);
    }
  }
});
