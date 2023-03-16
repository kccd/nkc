import { getDataById } from '../lib/js/dataConversion';
import Vue from 'vue';
const data = getDataById('data');

new Vue({
  el: '#app',
  data: {
    app: data.app,
  },
  computed: {
    inApp() {
      var ua = window.navigator.userAgent.toLowerCase();
      return ua.indexOf('micromessenger') > -1 || ua.indexOf(' qq') > -1;
    },
    appInfo() {
      const android = {
        disabled: true,
        url: '',
        version: '暂未开放',
        title: '暂未开放',
        desc: '',
      };
      if (this.app) {
        android.disabled = false;
        android.url = `/app/${data.app.appPlatForm}/${data.app.hash}`;
        android.version = 'v' + data.app.appVersion;
        android.title = '点击下载';
        android.desc = data.app.appDescription;
      }
      return {
        android,
        ios: {
          disabled: true,
          url: ``,
          version: '暂未开发',
          title: '暂未开发',
          desc: '',
        },
      };
    },
  },
  methods: {},
});
