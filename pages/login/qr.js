import { getState } from '../lib/js/state';
const state = getState();
import { nkcAPI } from '../lib/js/netAPI';
import { getUrl } from '../lib/js/tools';
import { getDataById } from '../lib/js/dataConversion';
const data = getDataById('data');
import { sweetSuccess, sweetError } from '../lib/js/sweetAlert';
import { RNCloseWebview } from '../lib/js/reactNative';
const app = new window.Vue({
  el: '#app',
  data: {
    logoUrl: getUrl('logo', 'sm'),
    delay: 3, // s
    timer: 0,
    websiteName: state.websiteName,
    QRWarning: data.QRWarning,
    status: 'unLogin', // unLogin, logging, logged
  },
  mounted() {
    this.setTimer();
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  methods: {
    setTimer() {
      this.timer = setTimeout(() => {
        this.delay -= 1;
        if (this.delay > 0) {
          this.setTimer();
        }
      }, 1000);
    },
    submit() {
      this.status = 'logging';
      nkcAPI(`/login/qr/${data.qrRecordId}`, 'POST', {})
        .then(() => {
          this.status = 'logged';
          sweetSuccess('登录成功');
        })
        .catch((err) => {
          this.status = 'unLogin';
          sweetError(`登录失败`);
        });
    },
    done() {
      RNCloseWebview();
    },
  },
});
